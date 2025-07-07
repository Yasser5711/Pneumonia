import { TRPCError } from '@trpc/server';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { createTestCaller } from '../../test/caller';
import { mockApiKeyService, mockUserService } from '../../test/services';
import { env } from '../env';

let originalEnv: typeof env;
vi.mock('../utils/session', () => ({
  getSession: () => ({ sub: 'user-id' }),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));
beforeEach(() => {
  mockUserService.findById.mockResolvedValue({
    id: 'fake-id',
    email: 'fake-email@example.com',
  });
  originalEnv = { ...env };

  mockApiKeyService.validateKey.mockResolvedValue({
    id: 'k',
    active: true,
    freeRequestsUsed: 0,
    freeRequestsQuota: 5,
  } as any);
  mockApiKeyService.markKeyUsed.mockResolvedValue(undefined);

  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(env, originalEnv);
});

const goodImage = 'data:image/png;base64,A==';

describe('predictPneumonia router', () => {
  it('passes with valid key → returns json.data', async () => {
    (fetch as any as Mock).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            model_details: {
              name: 'example-model',
              version: '1.0',
              input_size: [224, 224],
              decision_threshold: 0.5,
              class_mapping: { Pneumonia: 0, Normal: 1 },
            },
            prediction: { class: 'example-class', probability: 0.99 },
            heatmap_base64: 'data:image/png;base64,example-heatmap==',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const result = await createTestCaller({}).predictPneumonia({ imageBase64: goodImage });

    expect(result).toEqual({
      model_details: {
        name: 'example-model',
        version: '1.0',
        input_size: [224, 224],
        decision_threshold: 0.5,
        class_mapping: { Pneumonia: 0, Normal: 1 },
      },
      prediction: { class: 'example-class', probability: 0.99 },
      heatmap_base64: 'data:image/png;base64,example-heatmap==',
    });

    expect(fetch).toHaveBeenCalledWith(
      env.CNN_PREDICT_URL,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('fails when CNN_PREDICT_URL is missing', async () => {
    env.CNN_PREDICT_URL = undefined as any;
    const caller = createTestCaller({});

    await expect(caller.predictPneumonia({ imageBase64: goodImage })).rejects.toThrow(
      new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get prediction from the model server. Please try again later.',
      }),
    );
  });

  it('fails when fetch throws (network error)', async () => {
    (fetch as any as Mock).mockRejectedValueOnce(new Error('boom'));

    const caller = createTestCaller({});
    await expect(caller.predictPneumonia({ imageBase64: goodImage })).rejects.toThrow(
      new TRPCError({
        code: 'BAD_GATEWAY',
        message: 'Failed to get prediction from the model server. Please try again later.',
      }),
    );
  });

  it('fails on non-200 status', async () => {
    (fetch as any as Mock).mockResolvedValueOnce(new Response('bad', { status: 500 }));

    const caller = createTestCaller({});
    await expect(caller.predictPneumonia({ imageBase64: goodImage })).rejects.toThrow(
      new TRPCError({
        code: 'BAD_GATEWAY',
        message: 'Failed to get prediction from the model server. Please try again later.',
      }),
    );
  });
});
