import { Application, Graphics, Texture } from 'pixi.js'

export type MedShape = 'dot' | 'cross' | 'heart' | 'dna'

/**
 * Generates (or caches) the texture for a medical symbol.
 * No HTTP request; everything is drawn GPU-side.
 */
export function usePixiTextures(app: Application) {
  const cache = new Map<MedShape, Texture>()

  function make(shape: MedShape): Texture {
    if (cache.has(shape)) return cache.get(shape)!

    const g = new Graphics()

    switch (shape) {
      case 'cross': {
        // ✚
        const s = 1.6
        g.rect(-s, -4 * s, 2 * s, 8 * s)
          .rect(-4 * s, -s, 8 * s, 2 * s)
          .fill(0xffffff)
        break
      }
      case 'heart': {
        // ♥ — cardioid
        g.moveTo(0, 0)
          .bezierCurveTo(0, -6, 8, -6, 8, 0)
          .bezierCurveTo(8, 6, 0, 8, 0, 12)
          .bezierCurveTo(0, 8, -8, 6, -8, 0)
          .bezierCurveTo(-8, -6, 0, -6, 0, 0)
          .fill(0xff3366)
        g.scale.set(0.17)
        break
      }
      case 'dna': {
        // simplified double helix
        const h = 6
        for (let y = -h; y <= h; y += 2) {
          const x = Math.sin((y + h) * 0.8) * 4
          g.circle(x, y, 1).fill(0x66ccff)
          g.circle(-x, y, 1).fill(0x66ccff)
          g.setStrokeStyle({ width: 0.4, color: 0x66ccff })
            .moveTo(x, y)
            .lineTo(-x, y)
        }
        break
      }
      default: // small dot
        g.circle(0, 0, 1).fill(0xffffff)
    }

    g.position.set(8, 8) // anti-clipping margin
    const tex = app.renderer.generateTexture(g)
    cache.set(shape, tex)
    return tex
  }

  return { make }
}
