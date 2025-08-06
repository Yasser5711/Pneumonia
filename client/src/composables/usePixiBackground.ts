import {
  useMouse,
  useThrottle,
  useEventListener,
  tryOnScopeDispose,
} from '@vueuse/core'
import {
  Application,
  Graphics,
  Particle,
  ParticleContainer,
  Texture,
  Container,
} from 'pixi.js'
import { createNoise3D } from 'simplex-noise'
import { Pane } from 'tweakpane'

import { usePixiBgConfig } from '@/composables/usePixiBgConfig'
import { usePixiHeartbeat } from '@/composables/usePixiHeartbeat'
import { useTheme } from '@/composables/useTheme'

export function usePixiBackground() {
  /* DOM -------------------------------------------------------------------- */
  const elRef = ref<HTMLElement | null>(null)
  const paneHost = ref<HTMLElement | null>(null)

  /* Theme ------------------------------------------------------------------ */
  const { isDark } = useTheme()
  const tint = computed(() => (isDark.value ? 0xcccccc : 0x444444))
  const bgStyle = computed(() => (isDark.value ? '#000000' : '#ffffff'))

  /* Mouse Interaction ------------------------------------------------------ */
  const mouseRaw = useMouse()
  const mouse = {
    x: useThrottle(mouseRaw.x, 40),
    y: useThrottle(mouseRaw.y, 40),
  }

  const { cfg } = usePixiBgConfig()

  /* Pixi & Data ------------------------------------------------------------ */
  const noise3d = createNoise3D()
  const points: Array<{
    x: number
    y: number
    opacity: number
    particle: Particle
  }> = []
  const existing = new Set<string>()
  const scope = effectScope()

  let w = window.innerWidth
  let h = window.innerHeight
  let app: Application | null = null
  let dotTexture: Texture | null = null
  // let pulse: ReturnType<typeof usePixiPulse>
  let heartbeat: ReturnType<typeof usePixiHeartbeat>

  /* Utils ------------------------------------------------------------------ */
  function createDotTexture(pixi: Application) {
    const g = new Graphics().circle(0, 0, 1).fill(0xffffff)
    return pixi.renderer.generateTexture(g)
  }

  function addGridPoints(container: ParticleContainer) {
    if (!dotTexture) return
    for (let x = -cfg.spacing / 2; x < w + cfg.spacing; x += cfg.spacing) {
      for (let y = -cfg.spacing / 2; y < h + cfg.spacing; y += cfg.spacing) {
        const id = `${x}-${y}`
        if (existing.has(id)) continue
        existing.add(id)

        const p = new Particle(dotTexture)
        p.anchorX = p.anchorY = 0.5
        container.addParticle(p)

        const opacity = Math.random() * 0.5 + 0.5
        points.push({ x, y, opacity, particle: p })
      }
    }
  }

  const field = (x: number, y: number, z: number) =>
    (noise3d(x / cfg.scale, y / cfg.scale, z) - 0.5) * 2 * Math.PI

  /* Setup ------------------------------------------------------------------ */
  async function setupPixi() {
    if (!elRef.value) return

    /* Canvas Init ---------------------------------------------------------- */
    app = new Application()
    await app.init({
      background: bgStyle.value,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio,
      resizeTo: elRef.value,
      autoDensity: true,
      eventMode: 'none',
    })
    elRef.value.appendChild(app.canvas)

    const container = new ParticleContainer({
      dynamicProperties: { position: true, alpha: true },
    })
    app.stage.addChild(container)

    /* Pulse Layer ---------------------------------------------------------- */
    const pulseLayer = new Container()
    pulseLayer.blendMode = 'add'
    app.stage.addChild(pulseLayer)

    // pulse = usePixiPulse(app, { layer: pulseLayer })
    heartbeat = usePixiHeartbeat(app, {
      bpm: 72,
      color: 0xff3366,
      maxRadius: Math.max(window.innerWidth, window.innerHeight),
    })

    dotTexture = createDotTexture(app)
    addGridPoints(container)

    /* Main Loop ------------------------------------------------------------ */
    app.ticker.add(() => {
      const t = Date.now() / 10_000

      for (const p of points) {
        const { x, y, opacity, particle } = p

        /* Base Flow Field ------------------------------------------------ */
        const rad = field(x, y, t)
        const len =
          (noise3d(x / cfg.scale, y / cfg.scale, t * 2) + 0.5) * cfg.length
        let targetX = x + Math.cos(rad) * len
        let targetY = y + Math.sin(rad) * len

        /* Mouse Interaction --------------------------------------------- */
        const dx = targetX - mouse.x.value
        const dy = targetY - mouse.y.value
        const dist = Math.hypot(dx, dy)

        if (dist < cfg.mouseRadius && dist > 1) {
          const force = Math.exp(-dist / 60)
          const angle = Math.atan2(dy, dx)

          switch (cfg.mode) {
            case 'repel':
              targetX += Math.cos(angle) * force * cfg.repelForce
              targetY += Math.sin(angle) * force * cfg.repelForce
              break
            case 'gravity':
              targetX -= Math.cos(angle) * force * cfg.gravityForce
              targetY -= Math.sin(angle) * force * cfg.gravityForce
              break
            case 'orbit': {
              const orbitAngle = t * 2 + dist * 0.01
              targetX += Math.cos(orbitAngle) * cfg.orbitRadius
              targetY += Math.sin(orbitAngle) * cfg.orbitRadius
              break
            }
          }
        }

        /* Smooth Position Interpolation ------------------------------ */
        particle.x += (targetX - particle.x) * cfg.transition
        particle.y += (targetY - particle.y) * cfg.transition
        particle.alpha = (Math.abs(Math.cos(rad)) * 0.8 + 0.2) * opacity
        particle.tint = tint.value
      }
    })

    /* Dev Pane ------------------------------------------------------------- */
    if (import.meta.env.DEV) {
      const pane = new Pane({
        title: 'Pixi Debug',
        container: paneHost.value || document.body,
        expanded: false,
      })

      pane.addBinding(cfg, 'mode', {
        label: 'Mode',
        options: {
          Idle: 'idle',
          Repel: 'repel',
          Gravity: 'gravity',
          Orbit: 'orbit',
        },
      })
      pane.addBinding(cfg, 'transition', { min: 0, max: 0.3, step: 0.01 })
      pane.addBinding(cfg, 'scale', { min: 50, max: 1000, step: 50 })
      pane.addBinding(cfg, 'spacing', { min: 5, max: 50, step: 1 })
      pane.addBinding(cfg, 'length', { min: 1, max: 20, step: 1 })
      pane.addBinding(cfg, 'repelForce', { min: 10, max: 100, step: 1 })
      pane.addBinding(cfg, 'gravityForce', { min: 10, max: 100, step: 1 })
      pane.addBinding(cfg, 'mouseRadius', { min: 20, max: 300, step: 5 })

      /* Theme Sync --------------------------------------------------- */
      watch(isDark, () => pane.refresh())
      tryOnScopeDispose(() => pane.dispose())
    }

    /* Resize Handling ------------------------------------------------------ */
    scope.run(() => {
      useEventListener('resize', () => {
        w = window.innerWidth
        h = window.innerHeight
        addGridPoints(container)
      })

      tryOnScopeDispose(() => {
        app?.destroy(true, {
          children: true,
          texture: true,
          textureSource: true,
        })
      })
    })
  }

  /* Helpers ---------------------------------------------------------------- */
  function triggerExplosion(duration = 400) {
    if (!app) return
    // pulse.pulse('dna', mouse.x.value, mouse.y.value)
    heartbeat.spawnRing()
    cfg.mode = 'repel'
    setTimeout(() => (cfg.mode = 'idle'), duration)
  }

  /* Lifecycle -------------------------------------------------------------- */
  onMounted(() => {
    setupPixi()
    window.addEventListener('pixi-explosion', () => {
      triggerExplosion()
    })
  })

  tryOnScopeDispose(() => {
    scope.stop()
    window.removeEventListener('pixi-explosion', () => {
      triggerExplosion()
    })
  })

  return { elRef, mode: cfg.mode, triggerExplosion, paneHost }
}
