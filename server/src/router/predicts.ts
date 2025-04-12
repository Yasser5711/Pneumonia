import axios from 'axios';
import sharp from 'sharp';
import { z } from 'zod';
import { protectedProcedure } from '../trpc';

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
  .mutation(async ({ input }) => {
    console.log('✅ predictRouter loaded');

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

    const response = await axios.post(
      'https://yassermekhfi.us-east-1.aws.modelbit.com/v1/predict_pneumonia/latest',
      { data: [{ image_array: imageArray }] },
    );

    return response.data;
  });
