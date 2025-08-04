import { ref, onMounted, onUnmounted, effectScope } from 'vue'

import { useEventListener, useThrottle, useMouse } from '@vueuse/core'
import {
  Application,
  Graphics,
  Particle,
  ParticleContainer,
  Texture,
} from 'pixi.js'
import { createNoise3D } from 'simplex-noise'
import { Pane } from 'tweakpane'

export function usePixiBackground() {
  const elRef = ref<HTMLElement | null>(null)

  const mode = ref<'idle' | 'repel' | 'gravity'>('idle')

  const mouseRaw = useMouse()
  const mouse = {
    x: useThrottle(mouseRaw.x, 40),
    y: useThrottle(mouseRaw.y, 40),
  }

  // 🎛️ Paramètres tweakables
  const config = {
    scale: 1000,
    spacing: 20,
    length: 20,
    repelForce: 30,
    gravityForce: 20,
    mouseRadius: 120,
  }

  const noise3d = createNoise3D()
  const existingPoints = new Set<string>()
  const points: {
    x: number
    y: number
    opacity: number
    particle: Particle
  }[] = []

  let app: Application | null = null
  let w = 0
  let h = 0

  const scope = effectScope()

  const createDotTexture = (app: Application) => {
    const g = new Graphics().circle(0, 0, 1).fill(0xcccccc)
    return app.renderer.generateTexture(g)
  }

  const addPoints = ({
    dotTexture,
    container,
  }: {
    dotTexture: Texture
    container: ParticleContainer
  }) => {
    for (
      let x = -config.spacing / 2;
      x < w + config.spacing;
      x += config.spacing
    ) {
      for (
        let y = -config.spacing / 2;
        y < h + config.spacing;
        y += config.spacing
      ) {
        const id = `${x}-${y}`
        if (existingPoints.has(id)) continue
        existingPoints.add(id)

        const particle = new Particle(dotTexture)
        particle.anchorX = 0.5
        particle.anchorY = 0.5
        container.addParticle(particle)

        const opacity = Math.random() * 0.5 + 0.5
        points.push({ x, y, opacity, particle })
      }
    }
  }

  const getForceOnPoint = (x: number, y: number, z: number) =>
    (noise3d(x / config.scale, y / config.scale, z) - 0.5) * 2 * Math.PI

  const setupPixi = async () => {
    if (typeof window === 'undefined' || !elRef.value) return

    w = window.innerWidth
    h = window.innerHeight

    app = new Application()
    await app.init({
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio,
      resizeTo: elRef.value,
      eventMode: 'none',
      autoDensity: true,
    })

    elRef.value.appendChild(app.canvas)

    const container = new ParticleContainer({
      dynamicProperties: { position: true, alpha: true },
    })
    app.stage.addChild(container)

    const dotTexture = createDotTexture(app)
    addPoints({ dotTexture, container })

    app.ticker.add(() => {
      const t = Date.now() / 10000

      for (const p of points) {
        const { x, y, opacity, particle } = p

        let targetX = x
        let targetY = y

        const rad = getForceOnPoint(x, y, t)
        const len =
          (noise3d(x / config.scale, y / config.scale, t * 2) + 0.5) *
          config.length
        targetX += Math.cos(rad) * len
        targetY += Math.sin(rad) * len

        const dx = targetX - mouse.x.value
        const dy = targetY - mouse.y.value
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = config.mouseRadius

        if (dist < maxDist && dist > 1) {
          const force = Math.exp(-dist / 60)
          const angle = Math.atan2(dy, dx)

          if (mode.value === 'repel') {
            targetX += Math.cos(angle) * force * config.repelForce
            targetY += Math.sin(angle) * force * config.repelForce
          } else if (mode.value === 'gravity') {
            targetX -= Math.cos(angle) * force * config.gravityForce
            targetY -= Math.sin(angle) * force * config.gravityForce
          }
        }

        particle.x = targetX
        particle.y = targetY
        particle.alpha = (Math.abs(Math.cos(rad)) * 0.8 + 0.2) * opacity
      }
    })

    // 🎛️ Debug Panel (Tweakpane)
    const pane = new Pane({ title: 'Pixi Debug', expanded: false })

    pane.addBinding(mode, 'value', {
      label: 'Mode',
      options: {
        Idle: 'idle',
        Repel: 'repel',
        Gravity: 'gravity',
      },
    })
    pane.addBinding(config, 'scale', { min: 100, max: 3000, step: 100 })
    pane.addBinding(config, 'spacing', { min: 5, max: 100, step: 1 })
    pane.addBinding(config, 'length', { min: 5, max: 100, step: 1 })
    pane.addBinding(config, 'repelForce', { min: 5, max: 100, step: 1 })
    pane.addBinding(config, 'gravityForce', { min: 5, max: 100, step: 1 })
    pane.addBinding(config, 'mouseRadius', { min: 10, max: 300, step: 5 })

    scope.run(() => {
      useEventListener('resize', () => {
        w = window.innerWidth
        h = window.innerHeight
        addPoints({ dotTexture, container })
      })

      onUnmounted(() => {
        app?.destroy(true, {
          children: true,
          texture: true,
          textureSource: true,
        })
        pane.dispose()
      })
    })
  }

  function triggerExplosion(duration = 500) {
    mode.value = 'repel'
    setTimeout(() => {
      mode.value = 'idle'
    }, duration)
  }

  onMounted(setupPixi)
  onUnmounted(() => scope.stop())

  return {
    elRef,
    mode,
    triggerExplosion,
  }
}
