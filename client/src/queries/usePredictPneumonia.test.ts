import { usePredictPneumonia } from '@/queries/usePredictPneumonia'
import { renderComposable } from '@/tests/renderComposable'
import { describe, expect, it } from 'vitest'

describe('usePredictPneumonia', () => {
  it('should successfully mutate and return prediction result', async () => {
    const [mutation, app] = renderComposable(() => usePredictPneumonia())

    await mutation.mutateAsync({ imageBase64: 'valid-image' })

    expect(mutation.isSuccess.value).toBe(true)
    expect(mutation.data.value).toEqual({
      data: { image_array: [[[0]]] },
      model: 'example-model',
      model_version: '1.0',
      prediction: { class: 'example-class', probability: 0.99 },
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
