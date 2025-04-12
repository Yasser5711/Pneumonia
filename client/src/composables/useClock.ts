import { computed, onMounted, onUnmounted, ref } from "vue";

const FORMAT_KEY = "clock-format";

export const useClock = () => {
  const now = ref(new Date());
  const use12h = ref(localStorage.getItem(FORMAT_KEY) === "12");

  const toggleFormat = () => {
    use12h.value = !use12h.value;
    localStorage.setItem(FORMAT_KEY, use12h.value ? "12" : "24");
  };

  let interval: number;

  onMounted(() => {
    interval = window.setInterval(() => {
      now.value = new Date();
    }, 1000);
  });

  onUnmounted(() => {
    clearInterval(interval);
  });

  const timeParts = computed(() => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: use12h.value,
    };
    return new Intl.DateTimeFormat("en-US", options).formatToParts(now.value);
  });

  const fullDate = computed(() => {
    return now.value.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  return { timeParts, fullDate, use12h, toggleFormat };
};
