import axios from 'axios';
import * as dotenv from 'dotenv';
import sharp from 'sharp';
import { z } from 'zod';
import { protectedProcedure } from '../trpc';
dotenv.config();
export const predictRouter = protectedProcedure
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
    const PREDICT_URL = process.env.CNN_PREDICT_URL;
    if (!PREDICT_URL) throw new Error('CNN_PREDICT_URL is not set');
    const { imageBase64 } = input;

    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const { data } = await sharp(imageBuffer)
      .resize(128, 128)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const floatArray = Array.from(data).map((v) => v / 255);
    const imageArray: number[][][] = [];

    for (let y = 0; y < 128; y++) {
      const row: number[][] = [];
      for (let x = 0; x < 128; x++) {
        const idx = (y * 128 + x) * 3;
        row.push([floatArray[idx], floatArray[idx + 1], floatArray[idx + 2]]);
      }
      imageArray.push(row);
    }

    const response = await axios.post(PREDICT_URL, { data: [{ image_array: imageArray }] });

    return response.data;
  });
