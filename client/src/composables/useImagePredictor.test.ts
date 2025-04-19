import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderComposable } from '../tests/renderComposable'
import { useImagePredictor, type PredictionResult } from './useImagePredictor'

const predictAsync = vi.fn()
vi.mock('@/queries/usePredictPneumonia', () => ({
  usePredictPneumonia: () => ({
    mutateAsync: predictAsync,
    isPending: false,
    error: null,
  }),
}))

describe('useImagePredictor', () => {
  const FAKE_BASE64 = 'data:image/png;base64,MOCKED_BASE64=='
  const file = new File(['file content'], 'xray.png', { type: 'image/png' })

  beforeEach(() => {
    class MockFileReader {
      result: string | null = null
      onload:
        | ((this: FileReader, ev: ProgressEvent<FileReader>) => void)
        | null = null
      onerror:
        | ((this: FileReader, ev: ProgressEvent<FileReader>) => void)
        | null = null

      readAsDataURL(_file: File) {
        this.result = FAKE_BASE64
        const event = {
          target: { result: this.result },
        } as ProgressEvent<FileReader>
        this.onload?.call(this as unknown as FileReader, event)
      }
    }

    vi.stubGlobal('FileReader', MockFileReader)
    const mockResponse = {
      prediction: {
        class: 'Pneumonia',
        probability: 0.92,
      },
    }

    predictAsync.mockResolvedValue(mockResponse)
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.unstubAllGlobals()
  })

  it('predictFromFile: encodes file and calls predictAsync with base64 image', async () => {
    const [predictor, app] = renderComposable(() => useImagePredictor())

    const result = await predictor.predictFromFile(file)

    const expected: PredictionResult = {
      label: 'Pneumonia',
      probability_pneumonia: 0.92,
    }

    expect(result).toEqual(expected)
    expect(predictAsync).toHaveBeenCalledWith({ imageBase64: FAKE_BASE64 })
    expect(predictor.selectedFile.value).toStrictEqual(file)
    app.unmount()
  })

  it('predictFromUrl: fetches image, creates File, and calls predictFromFile', async () => {
    const blob = new Blob(['image content'], { type: 'image/jpeg' })
    const fetchMock = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(blob),
    })
    vi.stubGlobal('fetch', fetchMock)

    const [predictor, app] = renderComposable(() => useImagePredictor())
    predictor.imageUrl.value = 'https://example.com/image.jpg'

    const result = await predictor.predictFromUrl()
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/image.jpg')
    expect(predictor.selectedFile.value?.name).toBe('remote.jpg')
    expect(predictAsync).toHaveBeenCalledWith({ imageBase64: FAKE_BASE64 })
    expect(result).toEqual({
      label: 'Pneumonia',
      probability_pneumonia: 0.92,
    })
    app.unmount()
  })
})
