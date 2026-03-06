/* =============================================================================
   CLOUD — decorative parallax background element.
============================================================================= */
import { CONFIG } from './config.js';
import { randInt } from './utils.js';

export class Cloud {
  /**
   * @param {number} x     - starting X (can start off-screen right)
   * @param {number} y     - Y position
   * @param {number} scale - size multiplier
   */
  constructor(x, y, scale) {
    this.x     = x;
    this.y     = y;
    this.scale = scale;
  }

  /** Move the cloud leftward at a fraction of game speed (parallax). */
  update(gameSpeed) {
    this.x -= gameSpeed * CONFIG.BG.CLOUD_SPEED;
    // Wrap: when the cloud exits left, reappear far right
    if (this.x + 130 * this.scale < 0) {
      this.x     = CONFIG.CANVAS.WIDTH + randInt(0, 300);
      this.y     = randInt(15, 90);
      this.scale = 0.5 + Math.random() * 0.9;
    }
  }

  /** Draw a fluffy cloud from overlapping ellipses. */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.beginPath();
    ctx.ellipse(0,    0,  40, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(36,  -7,  28, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(-33, -4,  25, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
