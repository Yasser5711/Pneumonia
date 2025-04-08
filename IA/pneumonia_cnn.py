# Import necessary libraries
import os

import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import auc, classification_report, confusion_matrix, roc_curve
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.layers import (  # type: ignore
    Conv2D,
    Dense,
    Dropout,
    Flatten,
    Input,
    MaxPooling2D,
)
from tensorflow.keras.models import Sequential
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Define dataset path
dataset_path = "/kaggle/input/x-ray-datasets/chest_Xray"  # Adjust if your dataset path is different
# Create a results directory if it doesn't exist
os.makedirs("results", exist_ok=True)
# Define image parameters
IMG_SIZE = (128, 128)  # Adjust based on your dataset's image resolution
BATCH_SIZE = 32

# Data augmentation and preprocessing
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
)
val_test_datagen = ImageDataGenerator(rescale=1.0 / 255)
test_datagen = ImageDataGenerator(rescale=1.0 / 255)

# Load training data
train_generator = train_datagen.flow_from_directory(
    os.path.join(dataset_path, "train"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    subset="training",
)

# Load validation data
validation_generator = val_test_datagen.flow_from_directory(
    os.path.join(dataset_path, "val"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
)

# Load test data
test_generator = test_datagen.flow_from_directory(
    os.path.join(dataset_path, "test"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False,
)

# Define a lightweight CNN model
model = Sequential(
    [
        Input(shape=(128, 128, 3)),
        Conv2D(32, (3, 3), activation="relu"),
        MaxPooling2D(2, 2),
        Conv2D(64, (3, 3), activation="relu"),
        MaxPooling2D(2, 2),
        Flatten(),
        Dense(128, activation="relu"),
        Dropout(0.5),
        Dense(1, activation="sigmoid"),  # binary classification
    ]
)

# Compile the model
# model.compile(optimizer=Adam(learning_rate=0.001), loss='binary_crossentropy', metrics=['accuracy'])
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
# Set up early stopping
early_stopping = EarlyStopping(
    monitor="val_loss", patience=5, restore_best_weights=True
)

# Train the model
# history = model.fit(
#     train_generator,
#     validation_data=validation_generator,
#     epochs=50,  # Adjust based on your needs
#     callbacks=[early_stopping]
# )
history = model.fit(
    train_generator,
    validation_data=validation_generator,
    epochs=20,  # Start small, increase if needed
)
# Evaluate the model on the test set
# test_loss, test_acc = model.evaluate(test_generator)
# print(f'Test Accuracy: {test_acc:.2f}')
test_loss, test_acc = model.evaluate(test_generator)
print(f"Test Accuracy: {test_acc:.2f}")  # noqa: T201

# Generate predictions and compute ROC-AUC
y_pred = model.predict(test_generator)
y_true = test_generator.classes

fpr, tpr, _ = roc_curve(y_true, y_pred)
roc_auc = auc(fpr, tpr)

# Plot ROC Curve
plt.figure()
plt.plot(fpr, tpr, color="blue", lw=2, label=f"ROC curve (area = {roc_auc:.2f})")
plt.plot([0, 1], [0, 1], color="gray", lw=2, linestyle="--")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("Receiver Operating Characteristic")
plt.legend(loc="lower right")
plt.show()

# Compute and plot confusion matrix
# custom_threshold = 0.9  # TODO
# y_pred_classes = (y_pred > custom_threshold).astype(int)
y_pred_classes = (y_pred > 0.5).astype(int)
cm = confusion_matrix(y_true, y_pred_classes)

plt.figure(figsize=(8, 6))
sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=["Normal", "Pneumonia"],
    yticklabels=["Normal", "Pneumonia"],
)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.show()

# Classification report
print(  # noqa: T201
    classification_report(y_true, y_pred_classes, target_names=["Normal", "Pneumonia"])
)

# Save the model
model.save("/kaggle/working/pneumonia_cnn_model.h5")
