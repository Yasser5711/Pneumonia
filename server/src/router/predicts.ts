import axios from 'axios';
import { protectedProcedureAPI } from '../middlewares/index';

import sharp from 'sharp';
import { z } from 'zod';

import { env } from '../env';

export const predictRouter = protectedProcedureAPI
  .meta({
    openapi: {
      method: 'POST',
      path: '/predict',
      protect: true,
      summary: 'Make a pneumonia prediction from base64-encoded image',
      description:
        'Accepts a base64-encoded image, resizes and normalizes it, then sends it to the CNN model server for prediction.',
    },
  })
  .input(
    z.object({
      imageBase64: z
        .string()
        .startsWith('data:image/')
        .refine((str) => str.length < 10_000_000, {
          // 10 MB
          message: 'Image payload too large',
        }),
    }),
  )
  .output(
    z.object({
      model: z.string(),
      model_version: z.string(),
      prediction: z.object({
        class: z.string(),
        probability: z.number(),
      }),
    }),
  )
  .mutation(async ({ input }) => {
    const PREDICT_URL = env.CNN_PREDICT_URL;
    if (!PREDICT_URL) throw new Error('CNN_PREDICT_URL is not set');
    const { imageBase64 } = input;

    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const { data } = await sharp(imageBuffer)
      .resize(128, 128)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const floatArray = Array.from(data).map((v) => v / 255);
    const imageArray: number[][][] = [];

    for (let y = 0; y < 128; y++) {
      const row: number[][] = [];
      for (let x = 0; x < 128; x++) {
        const idx = y * 128 + x;
        row.push([floatArray[idx]]);
      }
      imageArray.push(row);
    }

    const response = await axios
      .post(PREDICT_URL, { data: [{ image_array: imageArray }] })
      .catch(() => {
        throw new Error('Error in CNN prediction');
      });
    return response.data.data;
  });
