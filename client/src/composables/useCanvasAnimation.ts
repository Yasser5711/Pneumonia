import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useRafFn, useWindowSize } from '@vueuse/core'

import { useTheme } from './useTheme'
const { isDark } = useTheme()

interface Particle {
  color: string
  currentColor: string

  x: number
  y: number
  z: number
  velX: number
  velY: number
  velZ: number
  originX: number
  originY: number
  originZ: number
  age: number
  dead: boolean
  alpha: number
  attack: number
  hold: number
  decay: number
  initValue: number
  holdValue: number
  lastValue: number
  stuckTime: number
  accelX: number
  accelY: number
  accelZ: number
}

const stateColors: Record<string, { light: string[]; dark: string[] }> = {
  success: {
    light: ['#22C55E', '#4ADE80', '#86EFAC'],
    dark: ['#15803D', '#22C55E', '#4ADE80'],
  },
  error: {
    light: ['#EF4444', '#F87171', '#FCA5A5'],
    dark: ['#B91C1C', '#DC2626', '#F87171'],
  },
  pending: {
    light: ['#FACC15', '#FDE047', '#FEF08A'],
    dark: ['#CA8A04', '#FACC15', '#FDE047'],
  },
  info: {
    light: ['#3B82F6', '#60A5FA', '#BFDBFE'],
    dark: ['#1E40AF', '#3B82F6', '#60A5FA'],
  },
}

function createCanvasAnimation() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const { width, height } = useWindowSize()

  let currentColorSet: string[] = []
  let currentState = 'info'

  const mouse = ref({ x: width.value / 2, y: height.value / 2 })
  const mouseInfluenceRadius = 120
  const mouseForce = 5

  // Flags d'état
  let isDispersing = false
  let isResetting = false
  let isIdle = false

  // Propriétés du système
  const fLen = 256
  const zMax = fLen - 2
  const zeroAlphaDepth = -750
  const projCenterX = ref(fLen) // sera mis à jour au resize
  const projCenterY = ref(fLen)
  const sphereRad = 256
  const sphereCenterY = 0
  const sphereCenterZ = -3 - sphereRad
  const particleRad = 2.5
  const randAccelX = 0.1
  const randAccelY = 0.1
  const randAccelZ = 0.1
  const gravity = 0
  const particleAlpha = 1
  const turnSpeed = (2 * Math.PI) / 1600

  let turnAngle = 0

  // Particules
  const particles: Particle[] = []

  const ctx = ref<CanvasRenderingContext2D | null>(null)

  const initCanvas = () => {
    if (!canvasRef.value) return
    canvasRef.value.width = width.value
    canvasRef.value.height = height.value
    ctx.value = canvasRef.value.getContext('2d')
    projCenterX.value = canvasRef.value.width / 2
    projCenterY.value = canvasRef.value.height / 2
  }
  const updateColorSetFromStateAndTheme = () => {
    const statePalette = stateColors[currentState] || stateColors.info
    currentColorSet = isDark.value ? statePalette.dark : statePalette.light
  }

  const addParticle = (
    x0: number,
    y0: number,
    z0: number,
    vx0: number,
    vy0: number,
    vz0: number,
    color: string,
  ): Particle => {
    const p: Particle = {
      x: x0,
      y: y0,
      z: z0,
      velX: vx0,
      velY: vy0,
      velZ: vz0,
      originX: x0,
      originY: y0,
      originZ: z0,
      age: 0,
      dead: false,
      alpha: 0,
      attack: 50,
      hold: 50,
      decay: 160,
      initValue: 0,
      holdValue: particleAlpha,
      lastValue: 0,
      stuckTime: 80 + Math.random() * 20,
      accelX: 0,
      accelY: gravity,
      accelZ: 0,
      color,
      currentColor: color,
    }
    return p
  }

  const generateParticles = (count: number) => {
    const colors = currentColorSet

    particles.length = 0
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(Math.random() * 2 - 1)
      const x0 = sphereRad * Math.sin(phi) * Math.cos(theta)
      const y0 = sphereRad * Math.sin(phi) * Math.sin(theta)
      const z0 = sphereRad * Math.cos(phi)
      particles.push(
        addParticle(
          x0,
          sphereCenterY + y0,
          sphereCenterZ + z0,
          0.002 * x0,
          0.002 * y0,
          0.002 * z0,
          colors[Math.floor(Math.random() * colors.length)],
        ),
      )
    }
  }
  function hexToRgba(hex: string, alpha: number): string {
    const bigint = parseInt(hex.slice(1), 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  function lerpColor(from: string, to: string, t: number): string {
    const parse = (hex: string) => {
      const bigint = parseInt(hex.slice(1), 16)
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      }
    }

    const c1 = parse(from)
    const c2 = parse(to)
    const r = Math.round(c1.r + (c2.r - c1.r) * t)
    const g = Math.round(c1.g + (c2.g - c1.g) * t)
    const b = Math.round(c1.b + (c2.b - c1.b) * t)
    return `rgb(${r},${g},${b})`
  }

  const draw = () => {
    if (!ctx.value || !canvasRef.value) return

    // Nettoyage explicite (important si bg transparent)
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

    // Si bg est défini, on remplit
    const bg = canvasRef.value.dataset.bg
    if (bg && bg !== 'transparent') {
      ctx.value.fillStyle = 'rgba(0, 0, 0, 0.05)' // petit alpha = traînée légère
      ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }

    turnAngle = (turnAngle + turnSpeed) % (2 * Math.PI)
    const sinAngle = Math.sin(turnAngle)
    const cosAngle = Math.cos(turnAngle)

    for (const p of particles) {
      p.age++
      if (isIdle) {
        // Calcule position projetée de la particule
        const rotX = cosAngle * p.x + sinAngle * (p.z - sphereCenterZ)
        const rotZ =
          -sinAngle * p.x + cosAngle * (p.z - sphereCenterZ) + sphereCenterZ
        const m = fLen / (fLen - rotZ)
        const projX = rotX * m + projCenterX.value
        const projY = p.y * m + projCenterY.value

        const dx = mouse.value.x - projX
        const dy = mouse.value.y - projY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < mouseInfluenceRadius) {
          const force = (1 - dist / mouseInfluenceRadius) * mouseForce
          const angle = Math.atan2(dy, dx)
          // On pousse sur les positions d'origine (espace 3D)
          p.x -= Math.cos(angle) * force
          p.y -= Math.sin(angle) * force
        } else {
          // retour vers la sphère
          const lerp = 0.02
          p.x += (p.originX - p.x) * lerp
          p.y += (p.originY - p.y) * lerp
          p.z += (p.originZ - p.z) * lerp
        }
      }

      if (isDispersing && p.age > p.stuckTime) {
        p.velX += p.accelX + randAccelX * (Math.random() * 2 - 1)
        p.velY += p.accelY + randAccelY * (Math.random() * 2 - 1)
        p.velZ += p.accelZ + randAccelZ * (Math.random() * 2 - 1)
        p.x += p.velX
        p.y += p.velY
        p.z += p.velZ
      } else if (isResetting) {
        const lerp = 0.05
        p.x += (p.originX - p.x) * lerp
        p.y += (p.originY - p.y) * lerp
        p.z += (p.originZ - p.z) * lerp
        const d =
          (p.originX - p.x) ** 2 +
          (p.originY - p.y) ** 2 +
          (p.originZ - p.z) ** 2
        if (d < 1) {
          p.x = p.originX
          p.y = p.originY
          p.z = p.originZ
          p.velX = p.velY = p.velZ = 0
          isIdle = true
        }
      }

      const rotX = cosAngle * p.x + sinAngle * (p.z - sphereCenterZ)
      const rotZ =
        -sinAngle * p.x + cosAngle * (p.z - sphereCenterZ) + sphereCenterZ
      const m = fLen / (fLen - rotZ)
      const projX = rotX * m + projCenterX.value
      const projY = p.y * m + projCenterY.value

      if (
        projX < 0 ||
        projX > canvasRef.value.width ||
        projY < 0 ||
        projY > canvasRef.value.height ||
        rotZ > zMax
      )
        continue

      // Alpha animation
      if (p.age < p.attack) {
        p.alpha = ((p.holdValue - p.initValue) / p.attack) * p.age + p.initValue
      } else {
        p.alpha = p.holdValue
      }

      const depthAlpha = Math.max(0, Math.min(1, 1 - rotZ / zeroAlphaDepth))
      p.currentColor = lerpColor(p.currentColor, p.color, 0.05)
      ctx.value.fillStyle = hexToRgba(p.currentColor, depthAlpha * p.alpha)
      ctx.value.fillStyle = hexToRgba(p.color, depthAlpha * p.alpha)

      ctx.value.beginPath()
      ctx.value.arc(projX, projY, m * particleRad, 0, Math.PI * 2)
      ctx.value.fill()
    }
  }

  const { pause, resume } = useRafFn(draw, { immediate: false })

  const startAnimation = () => {
    currentState = 'info'
    updateColorSetFromStateAndTheme()

    initCanvas()
    generateParticles(200)
    isDispersing = false
    isResetting = false
    isIdle = true
    resume()
  }

  const startDispersion = () => {
    isDispersing = true
    isResetting = false
    isIdle = false
  }

  const resetParticles = () => {
    isDispersing = false
    isResetting = false
    isIdle = true
    generateParticles(200)
  }

  const resetParticlesSmooth = () => {
    isDispersing = false
    isResetting = true
    isIdle = false
  }
  const changeTo = (state: string) => {
    currentState = state
    updateColorSetFromStateAndTheme()

    particles.forEach((p) => {
      p.color =
        currentColorSet[Math.floor(Math.random() * currentColorSet.length)]
    })
    isIdle = false
    startDispersion()
  }
  onMounted(() => {
    startAnimation()
    window.addEventListener('mousemove', (e) => {
      if (!canvasRef.value) return
      const rect = canvasRef.value.getBoundingClientRect()
      mouse.value.x = e.clientX - rect.left
      mouse.value.y = e.clientY - rect.top
    })
  })

  // onMounted(() => {
  //   startAnimation()
  // })
  onBeforeUnmount(() => {
    pause()
    window.removeEventListener('mousemove', () => {})
  })

  // onBeforeUnmount(() => {
  //   pause()
  // })

  watch([width, height], () => {
    if (!canvasRef.value) return
    canvasRef.value.width = width.value
    canvasRef.value.height = height.value
    projCenterX.value = width.value / 2
    projCenterY.value = height.value / 2
  })
  watch(isDark, () => {
    updateColorSetFromStateAndTheme()
    particles.forEach((p) => {
      p.color =
        currentColorSet[Math.floor(Math.random() * currentColorSet.length)]
    })
  })

  return {
    canvasRef,
    startAnimation,
    startDispersion,
    resetParticles,
    resetParticlesSmooth,
    changeTo,
  }
}
let _instance: ReturnType<typeof createCanvasAnimation> | null = null

export function useCanvasAnimation() {
  if (!_instance) _instance = createCanvasAnimation()
  return _instance
}
