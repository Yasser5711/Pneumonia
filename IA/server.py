import base64
import io
import logging
import os

import cv2
import numpy as np
import PIL.Image as Image
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tensorflow import keras

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_KEY = os.environ.get("CNN_MODEL_API_KEY", "")


def verify_api_key(request: Request):
    if not API_KEY:
        return  # no key configured = no auth required
    auth = request.headers.get("Authorization", "")
    if auth != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

CLASS_NAMES = {0: "NORMAL", 1: "PNEUMONIA"}
MODEL_DETAILS = {
    "name": "Pneumonia_CNN_Classifier",
    "version": "1.0.0",
    "input_size": (224, 224),
    "decision_threshold": 0.5,
    "class_mapping": {"NORMAL": 0, "PNEUMONIA": 1},
}

MODEL_PATH = "model/best_model.keras"
model = None
gradcam_explainer = None


def load_model():
    global model, gradcam_explainer
    logger.info("Loading model from %s ...", MODEL_PATH)
    model = keras.models.load_model(MODEL_PATH)
    logger.info("Model loaded successfully.")

    try:
        from tf_keras_vis.gradcam_plus_plus import GradcamPlusPlus

        gradcam_explainer = GradcamPlusPlus(model)
        logger.info("GradCAM++ explainer ready.")
    except Exception:
        logger.warning("tf_keras_vis not available – heatmaps disabled.", exc_info=True)
        gradcam_explainer = None


app = FastAPI(title="Pneumonia CNN API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    data: str  # base64-encoded image (with or without data URI prefix)


@app.on_event("startup")
def startup():
    load_model()


score_function = lambda output: output[0]


@app.get("/")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict", dependencies=[Depends(verify_api_key)])
def predict(req: PredictRequest):
    if model is None:
        return {"error": "Model not loaded."}

    image_base64 = req.data

    try:
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        image_bytes = base64.b64decode(image_base64)
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize(MODEL_DETAILS["input_size"])
        img_array = np.array(img) / 255.0
        input_array = np.expand_dims(img_array, axis=0)
    except Exception as e:
        logger.error("Image preprocessing error.", exc_info=True)
        return {"error": f"Failed to process image: {e}"}

    prediction_prob = float(model.predict(input_array)[0][0])
    is_pneumonia = prediction_prob > MODEL_DETAILS["decision_threshold"]
    predicted_label = CLASS_NAMES[1 if is_pneumonia else 0]

    heatmap_data_uri = None

    if predicted_label == "PNEUMONIA" and gradcam_explainer is not None:
        logger.info("Generating heatmap for PNEUMONIA prediction...")
        try:
            cam = gradcam_explainer(
                score_function,
                input_array,
                penultimate_layer=-1,
                seek_penultimate_conv_layer=True,
            )
            original_img_uint8 = np.uint8(img_array * 255)
            heatmap = np.uint8(
                cv2.applyColorMap(np.uint8(cam[0] * 255), cv2.COLORMAP_JET)
            )
            overlay = cv2.addWeighted(original_img_uint8, 0.6, heatmap, 0.4, 0)

            pil_img = Image.fromarray(cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB))
            buffered = io.BytesIO()
            pil_img.save(buffered, format="JPEG")
            heatmap_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
            heatmap_data_uri = f"data:image/jpeg;base64,{heatmap_b64}"
            logger.info("Heatmap generated successfully.")
        except Exception:
            logger.error("Heatmap generation failed.", exc_info=True)

    response_data = {
        "model_details": MODEL_DETAILS,
        "prediction": {"class": predicted_label, "probability": prediction_prob},
    }

    if heatmap_data_uri:
        response_data["heatmap_base64"] = heatmap_data_uri

    return {"data": response_data}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=7860, reload=True)
