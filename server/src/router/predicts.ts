import { TRPCError } from '@trpc/server';
import axios from 'axios';
import sharp from 'sharp';
import { z } from 'zod';

import { env } from '../env';
import { logger } from '../logger';
import { protectedProcedureAPI } from '../middlewares/index';

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
    if (!PREDICT_URL)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get prediction from the model server. Please try again later.',
      });
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
      .catch((err) => {
        logger().error({ err, url: PREDICT_URL }, '🔴 Erreur lors de la prédiction CNN');
        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: 'Failed to get prediction from the model server. Please try again later.',
        });
      });
    return response.data.data;
  });
