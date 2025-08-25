import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderComposable } from '../tests/renderComposable'

import { useFileUpload } from './useFileUpload'

const setupFileReaderMock = (
  config: { result?: string; error?: DOMException } = {},
) => {
  let onprogress: ((event: ProgressEvent<FileReader>) => void) | null = null
  let onload: (() => void) | null = null
  let onerror: (() => void) | null = null

  const mockReaderInstance = {
    get result() {
      return config.result ?? null
    },
    get error() {
      return config.error ?? null
    },

    set onprogress(fn) {
      onprogress = fn
    },
    get onprogress() {
      return onprogress
    },
    set onload(fn) {
      onload = fn
    },
    get onload() {
      return onload
    },
    set onerror(fn) {
      onerror = fn
    },
    get onerror() {
      return onerror
    },

    readAsDataURL: vi.fn(() => {
      setTimeout(() => {
        if (config.error) {
          if (onerror) {
            onerror()
          }
        } else {
          if (onprogress) {
            onprogress({
              lengthComputable: true,
              loaded: 50,
              total: 100,
            } as ProgressEvent<FileReader>)
            onprogress({
              lengthComputable: true,
              loaded: 100,
              total: 100,
            } as ProgressEvent<FileReader>)
          }
          if (onload) {
            onload()
          }
        }
      }, 0)
    }),
  }

  const constructorMock = vi.fn(() => mockReaderInstance)

  const FileReaderMock = Object.assign(constructorMock, {
    EMPTY: 0,
    LOADING: 1,
    DONE: 2,
  })

  vi.stubGlobal('FileReader', FileReaderMock)
}

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('initializes with default values', () => {
    const [result] = renderComposable(() => useFileUpload())
    const { uploadProgress, isUploadingFile, uploadError } = result

    expect(uploadProgress.value).toBe(0)
    expect(isUploadingFile.value).toBe(false)
    expect(uploadError.value).toBe(null)
  })

  it('processes a file successfully', async () => {
    const mockFile = new File(['dummy content'], 'test.png', {
      type: 'image/png',
    })
    const mockBase64 = 'data:image/png;base64,ZHVtbXkgY29udGVudA=='

    setupFileReaderMock({ result: mockBase64 })

    const [result] = renderComposable(() => useFileUpload())
    const {
      processUploadedFile,
      uploadProgress,
      isUploadingFile,
      uploadError,
    } = result

    const promise = processUploadedFile(mockFile)

    expect(isUploadingFile.value).toBe(true)
    expect(uploadError.value).toBe(null)

    vi.runAllTimers()

    const uploadResult = await promise

    expect(uploadResult.base64Data).toBe(mockBase64)
    expect(uploadResult.file).toBe(mockFile)
    expect(isUploadingFile.value).toBe(false)
    expect(uploadProgress.value).toBe(100)
    expect(uploadError.value).toBe(null)
  })

  it('handles error when no file is provided', async () => {
    const [result] = renderComposable(() => useFileUpload())
    const { processUploadedFile, uploadError } = result

    // @ts-expect-error: Testing invalid input is intentional here
    await expect(processUploadedFile(null)).rejects.toThrow('No file provided')

    expect(uploadError.value).toBe('No file provided')
  })

  it('handles FileReader errors', async () => {
    const mockFile = new File(['dummy content'], 'test.txt', {
      type: 'text/plain',
    })
    const errorMessage = 'Error reading file'
    const mockError = new DOMException(errorMessage)

    setupFileReaderMock({ error: mockError })

    const [result] = renderComposable(() => useFileUpload())
    const {
      processUploadedFile,
      isUploadingFile,
      uploadError,
      uploadProgress,
    } = result

    const promise = processUploadedFile(mockFile)

    vi.runAllTimers()

    await expect(promise).rejects.toThrow(`Error reading file`)

    expect(isUploadingFile.value).toBe(false)
    expect(uploadProgress.value).toBe(0)
    expect(uploadError.value).toContain(errorMessage)
  })

  it('updates progress during file reading', async () => {
    const mockFile = new File(['a'.repeat(100)], 'large-file.txt', {
      type: 'text/plain',
    })
    const mockBase64 =
      'data:text/plain;base64,' +
      Buffer.from('a'.repeat(100)).toString('base64')

    setupFileReaderMock({ result: mockBase64 })

    const [result] = renderComposable(() => useFileUpload())
    const { processUploadedFile, uploadProgress } = result

    const promise = processUploadedFile(mockFile)

    vi.runAllTimers()
    await promise
    expect(uploadProgress.value).toBe(100)
  })

  it('resets the state correctly', async () => {
    const mockFile = new File(['content'], 'error.txt', { type: 'text/plain' })
    const mockError = new DOMException('An error occurred')

    setupFileReaderMock({ error: mockError })

    const [result] = renderComposable(() => useFileUpload())
    const {
      processUploadedFile,
      resetFileUpload,
      uploadProgress,
      isUploadingFile,
      uploadError,
    } = result

    const errorPromise = processUploadedFile(mockFile)

    vi.runAllTimers()

    await expect(errorPromise).rejects.toThrow()

    expect(isUploadingFile.value).toBe(false)
    expect(uploadError.value).not.toBe(null)

    resetFileUpload()

    expect(uploadProgress.value).toBe(0)
    expect(isUploadingFile.value).toBe(false)
    expect(uploadError.value).toBe(null)
  })
})
