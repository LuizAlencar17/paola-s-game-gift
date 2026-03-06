/* =============================================================================
   BACKGROUND — sky gradient, clouds, and scrolling ground.
============================================================================= */
import { CONFIG } from './config.js';

/**
 * Draw the full background for one frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Cloud[]} clouds        - array of Cloud instances
 * @param {number}  groundScrollX - current horizontal scroll offset
 */
export function drawBackground(ctx, clouds, groundScrollX) {
  const W = CONFIG.CANVAS.WIDTH;
  const H = CONFIG.CANVAS.HEIGHT;
  const G = CONFIG.GROUND_Y;

  // ── Sky gradient ──────────────────────────────────────────
  const skyGrad = ctx.createLinearGradient(0, 0, 0, G);
  skyGrad.addColorStop(0, CONFIG.BG.SKY_TOP);
  skyGrad.addColorStop(1, CONFIG.BG.SKY_BOTTOM);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, G);

  // ── Clouds ────────────────────────────────────────────────
  clouds.forEach(c => c.draw(ctx));

  // ── Ground: dirt sub-layer ────────────────────────────────
  ctx.fillStyle = CONFIG.BG.DIRT;
  ctx.fillRect(0, G, W, H - G);

  // ── Ground: grass top strip ───────────────────────────────
  ctx.fillStyle = CONFIG.BG.GROUND;
  ctx.fillRect(0, G, W, 16);

  // ── Ground: darker edge line ──────────────────────────────
  ctx.fillStyle = CONFIG.BG.GROUND_EDGE;
  ctx.fillRect(0, G, W, 4);

  // ── Ground: scrolling track marks (shows movement) ────────
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth   = 2;
  const markSpacing = 60;
  const offset      = groundScrollX % markSpacing;

  for (let mx = -markSpacing + offset; mx < W + markSpacing; mx += markSpacing) {
    ctx.beginPath();
    ctx.moveTo(mx, G + 4);
    ctx.lineTo(mx - 14, G + 16);
    ctx.stroke();
  }
}
