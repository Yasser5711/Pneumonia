import { tryOnScopeDispose } from '@vueuse/core'
import { Application, Graphics, Container } from 'pixi.js'

interface HeartbeatOpts {
  bpm?: number // Beats per minute (default: 75)
  color?: number // Stroke color (default: #ff3366)
  lineWidth?: number // Stroke thickness
  maxRadius?: number // Final radius in px
  origin?: () => { x: number; y: number } // Heart origin (default: center of viewport)
}

export function usePixiHeartbeat(app: Application, opts: HeartbeatOpts = {}) {
  /* ---------- options & defaults ------------------------------ */
  const bpm = opts.bpm ?? 75
  const color = opts.color ?? 0xff3366
  const lineWidth = opts.lineWidth ?? 2
  const maxRadius =
    opts.maxRadius ?? Math.max(window.innerWidth, window.innerHeight)
  const origin =
    opts.origin ??
    (() => ({ x: app.renderer.width / 2, y: app.renderer.height / 2 }))

  /* ---------- isolated layer (ADD blend mode) ----------------- */
  const layer = new Container()
  layer.blendMode = 'add'
  app.stage.addChild(layer)

  /* ---------- “lub-dub” timing -------------------------------- */
  const beatInterval = 60_000 / bpm // ms between beats
  let nextBeat = performance.now()

  function scheduleNext() {
    // Double pulse: ♩ ♪ then rest
    nextBeat += beatInterval
    setTimeout(() => spawnRing(0.9), 0) // lub
    setTimeout(() => spawnRing(0.6), beatInterval * 0.25) // smaller dub
  }

  /* ---------- create a ring ----------------------------------- */
  const running = ref<Graphics[]>([])

  function spawnRing(initialAlpha = 1) {
    const { x, y } = origin()
    const g = new Graphics()
      .setStrokeStyle({ width: lineWidth, color })
      .circle(0, 0, 1) // radius 1 → we scale it
    g.position.set(x, y)
    g.alpha = initialAlpha
    layer.addChild(g)
    running.value.push(g)

    let life = 0 // 0 → 1 (100%)
    const ticker = () => {
      life += app.ticker.deltaMS / 800 // 0.8s animation
      g.scale.set(1 + (life * maxRadius) / 10) // expand
      g.alpha = initialAlpha * (1 - life) // fade out
      if (life >= 1) {
        layer.removeChild(g)
        g.destroy()
        app.ticker.remove(ticker)
      }
    }
    app.ticker.add(ticker)
  }

  /* ---------- main loop --------------------------------------- */
  app.ticker.add(() => {
    const now = performance.now()
    if (now >= nextBeat) scheduleNext()
  })

  /* ---------- cleanup ----------------------------------------- */
  tryOnScopeDispose(() => {
    running.value.forEach((g) => g.destroy())
    layer.destroy({ children: true })
    app.ticker.remove(scheduleNext)
  })

  return { spawnRing } // trigger manually
}
