/* =============================================================================
   GROUND OBSTACLE — 5 typed ground obstacles that scroll left.
============================================================================= */
import { CONFIG } from './config.js';
import { IMAGES } from './assets.js';
import { randInt, drawRoundRect, drawImageContain } from './utils.js';

export class GroundObstacle {
  /**
   * @param {number}  gameSpeed - current scroll speed
   * @param {number} [type]     - 0–4; omit for a random type
   */
  constructor(gameSpeed, type) {
    this.type = (type !== undefined)
      ? type
      : randInt(0, CONFIG.GROUND_OBSTACLE_TYPES.length - 1);

    const base   = CONFIG.GROUND_OBSTACLE_TYPES[this.type];
    const scale  = 0.8 + Math.random() * 0.4;   // ±20 % size variation
    this.width   = Math.round(base.width  * scale);
    this.height  = Math.round(base.height * scale);
    this.x       = CONFIG.CANVAS.WIDTH + 20;
    this.y       = CONFIG.GROUND_Y - this.height;
    this.speed   = gameSpeed;
  }

  update(gameSpeed) {
    this.speed = gameSpeed;
    this.x    -= this.speed;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    const img = IMAGES.groundObstacles[this.type];
    if (img) {
      // Render at natural aspect ratio, pinned to the ground baseline
      drawImageContain(ctx, img, this.x, this.y, this.width, this.height, 'bottom');
      return;
    }
    // Per-type canvas fallbacks
    switch (this.type) {
      case 0: this._drawCactus(ctx);   break;
      case 1: this._drawBoulder(ctx);  break;
      case 2: this._drawLog(ctx);      break;
      case 3: this._drawFence(ctx);    break;
      case 4: this._drawMushroom(ctx); break;
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  // ── Fallback drawings ────────────────────────────────────

  /** Type 0 — spiky green cactus */
  _drawCactus(ctx) {
    const { x, y, width: w, height: h } = this;
    ctx.fillStyle   = '#4CAF50';
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth   = 2;
    const tw = w * 0.35, tx = x + (w - tw) / 2;
    drawRoundRect(ctx, tx, y + h * 0.25, tw, h * 0.75, 6);
    drawRoundRect(ctx, x,            y + h * 0.38, w * 0.38, h * 0.17, 5);
    drawRoundRect(ctx, x,            y + h * 0.18, w * 0.26, h * 0.24, 5);
    drawRoundRect(ctx, x + w * 0.62, y + h * 0.46, w * 0.38, h * 0.17, 5);
    drawRoundRect(ctx, x + w * 0.74, y + h * 0.28, w * 0.26, h * 0.24, 5);
  }

  /** Type 1 — rough grey boulder */
  _drawBoulder(ctx) {
    const { x, y, width: w, height: h } = this;
    const cx = x + w / 2, cy = y + h / 2;
    ctx.fillStyle   = '#9e9e9e';
    ctx.strokeStyle = '#616161';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + h * 0.05, w * 0.48, h * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.12, cy - h * 0.15, w * 0.2, h * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // Crack
    ctx.strokeStyle = '#424242';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.05, y + h * 0.15);
    ctx.lineTo(cx - w * 0.1,  y + h * 0.45);
    ctx.stroke();
  }

  /** Type 2 — brown log on its side */
  _drawLog(ctx) {
    const { x, y, width: w, height: h } = this;
    ctx.fillStyle   = '#8d6e63';
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth   = 2;
    drawRoundRect(ctx, x, y + h * 0.3, w, h * 0.7, 8);
    // End cap
    ctx.fillStyle = '#a1887f';
    ctx.beginPath();
    ctx.ellipse(x + 8, y + h * 0.65, 7, h * 0.33, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bark lines
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth   = 1.2;
    for (let i = 0.2; i < 1; i += 0.22) {
      ctx.beginPath();
      ctx.moveTo(x + w * i, y + h * 0.3);
      ctx.lineTo(x + w * i, y + h);
      ctx.stroke();
    }
    // Knot
    ctx.fillStyle   = '#6d4c41';
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.ellipse(x + w * 0.6, y + h * 0.65, w * 0.1, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  /** Type 3 — wooden fence post pair */
  _drawFence(ctx) {
    const { x, y, width: w, height: h } = this;
    const postW = w * 0.28;
    ctx.fillStyle   = '#c8a96e';
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth   = 1.8;
    [x + w * 0.1, x + w * 0.62].forEach(px => {
      drawRoundRect(ctx, px, y, postW, h, 4);
      // Pointed top
      ctx.fillStyle = '#c8a96e';
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px + postW / 2, y - h * 0.12);
      ctx.lineTo(px + postW, y);
      ctx.fill();
      ctx.stroke();
    });
    // Horizontal rails
    ctx.fillStyle   = '#d4b478';
    ctx.strokeStyle = '#8b6914';
    [0.25, 0.58].forEach(fy =>
      drawRoundRect(ctx, x + w * 0.05, y + h * fy, w * 0.9, h * 0.12, 3)
    );
  }

  /** Type 4 — chunky red-cap mushroom */
  _drawMushroom(ctx) {
    const { x, y, width: w, height: h } = this;
    const cx = x + w / 2;
    // Stem
    ctx.fillStyle   = '#efebe9';
    ctx.strokeStyle = '#a1887f';
    ctx.lineWidth   = 2;
    drawRoundRect(ctx, cx - w * 0.18, y + h * 0.52, w * 0.36, h * 0.48, 5);
    // Cap
    ctx.fillStyle   = '#e53935';
    ctx.strokeStyle = '#b71c1c';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.46, w * 0.5, h * 0.46, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    // White spots
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    [[0, -0.22, 5], [-0.25, -0.1, 4], [0.26, -0.08, 4]].forEach(([dx, dy, r]) => {
      ctx.beginPath();
      ctx.arc(cx + w * dx, y + h * (0.46 + dy), r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
