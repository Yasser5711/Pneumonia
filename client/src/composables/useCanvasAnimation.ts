import { useRafFn, useWindowSize } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTheme } from './useTheme'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

export function useCanvasAnimation() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const isAnimating = ref(false)
  const particles = ref<Particle[]>([])
  const { width, height } = useWindowSize()
  const theme = useTheme()

  // Colors for different themes
  const lightColors = ['#3B82F6', '#14B8A6', '#6366F1', '#9CA3AF']
  const darkColors = ['#60A5FA', '#2DD4BF', '#818CF8', '#9CA3AF']

  // Initialize particles
  const initParticles = () => {
    if (!canvasRef.value) return

    const ctx = canvasRef.value.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvasRef.value.width = width.value
    canvasRef.value.height = height.value

    // Create particles
    const particleCount = Math.floor((width.value * height.value) / 20000) // Adjust density
    const newParticles: Particle[] = []
    const colors = theme.isDark ? darkColors : lightColors

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * width.value,
        y: Math.random() * height.value,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    particles.value = newParticles
  }

  // Draw animation frame
  const draw = () => {
    if (!canvasRef.value) return

    const ctx = canvasRef.value.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width.value, height.value)

    // Update and draw particles
    particles.value.forEach((particle) => {
      // Update position
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Handle edge cases
      if (particle.x < 0) particle.x = width.value
      if (particle.x > width.value) particle.x = 0
      if (particle.y < 0) particle.y = height.value
      if (particle.y > height.value) particle.y = 0

      // Draw particle
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.opacity
      ctx.fill()
    })

    // Draw connections between nearby particles
    ctx.globalAlpha = 0.1
    ctx.strokeStyle = theme.isDark ? '#60A5FA' : '#3B82F6'
    ctx.lineWidth = 0.5

    for (let i = 0; i < particles.value.length; i++) {
      for (let j = i + 1; j < particles.value.length; j++) {
        const p1 = particles.value[i]
        const p2 = particles.value[j]
        const distance = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2),
        )

        // Only connect particles within a certain distance
        if (distance < 100) {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }
    }
  }

  // Animation loop using requestAnimationFrame
  const { pause, resume } = useRafFn(draw, { immediate: false })

  // Watch for theme changes
  watch(
    () => theme.isDark,
    () => {
      // Update particle colors
      particles.value.forEach((particle) => {
        const colors = theme.isDark ? darkColors : lightColors
        particle.color = colors[Math.floor(Math.random() * colors.length)]
      })
    },
  )

  // Watch for window resize
  watch([width, height], () => {
    if (canvasRef.value) {
      canvasRef.value.width = width.value
      canvasRef.value.height = height.value
      initParticles()
    }
  })

  // Initialize animation
  const startAnimation = () => {
    if (canvasRef.value) {
      initParticles()
      resume()
      isAnimating.value = true
    }
  }

  // Stop animation
  const stopAnimation = () => {
    pause()
    isAnimating.value = false
  }

  // Lifecycle hooks
  onMounted(() => {
    startAnimation()
  })

  onBeforeUnmount(() => {
    stopAnimation()
  })

  return {
    canvasRef,
    isAnimating,
    startAnimation,
    stopAnimation,
  }
}
