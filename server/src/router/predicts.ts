import { TRPCError } from '@trpc/server';
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
      model_details: z
        .object({
          name: z.string(),
          version: z.string(),
          input_size: z.tuple([z.number(), z.number()]),
          decision_threshold: z.number(),
          class_mapping: z.record(z.string(), z.number()),
        })
        .optional(),
      prediction: z.object({
        class: z.string(),
        probability: z.number(),
      }),
      heatmap_base64: z.string().optional(),
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

    let response: Response;
    try {
      response = await fetch(PREDICT_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: imageBase64 }),
      });
    } catch (err) {
      logger().error({ err, url: PREDICT_URL }, '🔴 Fetch failed');
      throw new TRPCError({
        code: 'BAD_GATEWAY',
        message: 'Failed to get prediction from the model server. Please try again later.',
      });
    }

    if (!response.ok) {
      logger().error({ status: response.status, url: PREDICT_URL }, '🔴 Bad status from model');
      throw new TRPCError({
        code: 'BAD_GATEWAY',
        message: 'Failed to get prediction from the model server. Please try again later.',
      });
    }

    const json = await response.json();
    return json.data;
  });
