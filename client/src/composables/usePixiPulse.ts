// import { BLEND_MODES } from '@pixi/constants'
import { ref } from 'vue'

import { tryOnScopeDispose } from '@vueuse/core'
import { Application, Container, Sprite } from 'pixi.js'

import { usePixiTextures, type MedShape } from './usePixiTextures'

interface UsePixiPulseOptions {
  /** Layer where to place the sprites. If omitted, an ADD blend Container is created. */
  layer?: Container
  /** Default shape if none is provided during `pulse()` */
  defaultShape?: MedShape
}

/**
 * Adds a “pulse” effect (heart, cross, DNA...) to an existing Pixi render.
 * No network dependency; auto-cleans itself when the animation ends.
 */
export function usePixiPulse(app: Application, opts: UsePixiPulseOptions = {}) {
  const { make } = usePixiTextures(app)

  // Dedicated layer to isolate pulse effects (ADD blend mode by default)
  const layer = opts.layer ?? new Container()
  if (!opts.layer) {
    layer.blendMode = 'add'
    app.stage.addChild(layer)
  }

  // List of active animations for proper cleanup
  const running = ref<Sprite[]>([])
  // const running = ref<Graphics[]>([]) // uncomment if using graphics instead

  function pulse(
    shape: MedShape = opts.defaultShape ?? 'heart',
    x: number,
    y: number,
    color?: number,
  ) {
    const tex = make(shape)
    const spr = new Sprite(tex)
    spr.anchor.set(0.5)
    spr.position.set(x, y)
    spr.alpha = 0.9
    if (color) spr.tint = color
    layer.addChild(spr)
    running.value.push(spr)

    let life = 40 // frames @60 fps ≈ 0.66s
    const tickerFn = () => {
      life -= 1
      const t = 1 - life / 40
      spr.scale.set(1 + t)
      spr.alpha = 1 - t
      if (life <= 0) {
        layer.removeChild(spr)
        spr.destroy()
        app.ticker.remove(tickerFn)
        running.value.splice(running.value.indexOf(spr), 1)
      }
    }
    app.ticker.add(tickerFn)
  }

  /* Cleanup: destroy everything if the scope is unmounted */
  tryOnScopeDispose(() => {
    running.value.forEach((spr) => spr.destroy())
    layer.destroy({ children: true })
  })

  return { pulse }
}
