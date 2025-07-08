import { describe, expect, it } from 'vitest'

import { renderComposable } from '../tests/renderComposable'

import { usePredictPneumonia } from './usePredictPneumonia'

describe('usePredictPneumonia', () => {
  it('should successfully mutate and return prediction result', async () => {
    const [mutation, app] = renderComposable(() => usePredictPneumonia())

    await mutation.mutateAsync({ imageBase64: 'valid-image' })

    expect(mutation.isSuccess.value).toBe(true)
    expect(mutation.data.value).toEqual({
      model_details: {
        name: 'example-model',
        version: '1.0',
        input_size: [224, 224],
        decision_threshold: 0.5,
        class_mapping: { Pneumonia: 0, Normal: 1 },
      },
      prediction: { class: 'example-class', probability: 0.99 },
      heatmap_base64: 'data:image/png;base64,example-heatmap==',
    })

    app.unmount()
  })

  it('should handle mutation error', async () => {
    const [mutation, app] = renderComposable(() => usePredictPneumonia())

    await mutation.mutateAsync({ imageBase64: 'error' }).catch(() => {})

    expect(mutation.isError.value).toBe(true)
    expect(mutation.error.value).toBeInstanceOf(Error)
    expect(mutation.error.value?.message).toBe('Prediction failed')

    app.unmount()
  })
})
