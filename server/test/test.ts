import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { AppRouter } from '../src/router/_app';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇️ change this to the image path you want to test
const IMAGE_PATH = path.resolve(__dirname, 'test_xray_1.png');

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers() {
        return {
          'x-api-key': process.env.API_KEY || 'my-secret-api-key',
        };
      },
    }),
  ],
});

async function imageToBase64(imagePath: string): Promise<string> {
  const imageBuffer = await fs.readFile(imagePath);
  const base64String = imageBuffer.toString('base64');

  // Determine MIME type based on extension
  const ext = path.extname(imagePath).toLowerCase().replace('.', '');
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext;

  return `data:image/${mime};base64,${base64String}`;
}

async function main() {
  const imageBase64 = await imageToBase64(IMAGE_PATH);

  const result = await trpc.predictPneumonia.mutate({
    imageBase64,
  });

  console.log('🎯 Prediction result:', result);
}

main().catch(console.error);
