import { useStorageStore } from '@/stores/storageStore'
import { computed, onMounted, onUnmounted, ref } from 'vue'

export const useClock = () => {
  const storageStore = useStorageStore()

  const time = storageStore.getKeyFromLocalStorage('clock', {
    local: navigator.language,
    showSeconds: false,
    showDate: false,
    options: {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'short',
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    },
  })

  const now = ref(new Date())

  const toggleFormat = () => {
    time.value.options.hour12 = !time.value.options.hour12
  }

  let interval: number

  onMounted(() => {
    interval = window.setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  onUnmounted(() => {
    clearInterval(interval)
  })

  const timeParts = computed(() => {
    const { options, showSeconds, showDate, local } = time.value

    const dynamicOptions: Intl.DateTimeFormatOptions = {
      hour: options.hour,
      minute: options.minute,
      hour12: options.hour12,
    }

    if (showSeconds) dynamicOptions.second = options.second
    if (showDate) {
      dynamicOptions.weekday = options.weekday
      dynamicOptions.year = options.year
      dynamicOptions.month = options.month
      dynamicOptions.day = options.day
    }

    return new Intl.DateTimeFormat(local, dynamicOptions).formatToParts(
      now.value,
    )
  })

  const fullDate = computed(() => {
    const { options, showSeconds, showDate } = time.value

    const dynamicOptions: Intl.DateTimeFormatOptions = {
      hour: options.hour,
      minute: options.minute,
      hour12: options.hour12,
    }

    if (showSeconds) dynamicOptions.second = options.second
    if (showDate) {
      dynamicOptions.weekday = options.weekday
      dynamicOptions.year = options.year
      dynamicOptions.month = options.month
      dynamicOptions.day = options.day
    }

    return now.value.toLocaleDateString(undefined, dynamicOptions)
  })

  return { timeParts, fullDate, toggleFormat }
}
