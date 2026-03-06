/* =============================================================================
   AERIAL OBSTACLE — 2 typed obstacles that fall from the sky then drift left.
============================================================================= */
import { CONFIG } from './config.js';
import { IMAGES } from './assets.js';
import { randInt } from './utils.js';
import { drawImageContain } from './utils.js';

export class AerialObstacle {
  /**
   * Spawns above the canvas, falls to a target hover-height, then scrolls
   * left with the world. Player must jump over it.
   *
   * @param {number}  gameSpeed - current scroll speed
   * @param {number} [type]     - 0–1; omit for a random type
   */
  constructor(gameSpeed, type) {
    this.type = (type !== undefined)
      ? type
      : randInt(0, CONFIG.AERIAL_OBSTACLE_TYPES.length - 1);

    const base   = CONFIG.AERIAL_OBSTACLE_TYPES[this.type];
    const scale  = 0.85 + Math.random() * 0.3;
    this.width   = Math.round(base.width  * scale);
    this.height  = Math.round(base.height * scale);

    // Spawn off-screen to the right, above the canvas
    this.x = CONFIG.CANVAS.WIDTH + randInt(20, 180);
    this.y = -this.height - randInt(10, 60);

    // Target hover height (random distance above the ground)
    const hr     = CONFIG.AERIAL_HOVER_RANGE;
    this.targetY = CONFIG.GROUND_Y - this.height - randInt(hr.MIN, hr.MAX);

    this.landed  = false;   // true once the obstacle reaches targetY
    this.speed   = gameSpeed;
    this._wobble = 0;       // small vertical oscillation while hovering
  }

  update(gameSpeed) {
    this.speed = gameSpeed;
    this.x    -= this.speed;

    if (!this.landed) {
      this.y += CONFIG.PHYSICS.AERIAL_FALL_SPEED;
      if (this.y >= this.targetY) {
        this.y      = this.targetY;
        this.landed = true;
      }
    } else {
      // Gentle wobble once hovering
      this._wobble += 0.08;
      this.y        = this.targetY + Math.sin(this._wobble) * 3;
    }
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  /** @param {CanvasRenderingContext2D} ctx */
  draw(ctx) {
    const img = IMAGES.aerialObstacles[this.type];
    if (img) {
      // Render at natural aspect ratio, centred in the bounding box
      drawImageContain(ctx, img, this.x, this.y, this.width, this.height, 'center');
      return;
    }
    switch (this.type) {
      case 0: this._drawMeteor(ctx); break;
      case 1: this._drawBird(ctx);   break;
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  // ── Fallback drawings ──────────────────────────────────────

  /** Type 0 — glowing meteor / space rock */
  _drawMeteor(ctx) {
    const { x, y, width: w, height: h } = this;
    const cx = x + w / 2, cy = y + h / 2;

    // Fire trail (only while still falling)
    if (!this.landed) {
      ctx.save();
      const trailGrad = ctx.createLinearGradient(cx, y - 24, cx, y);
      trailGrad.addColorStop(0, 'rgba(255,120,20,0)');
      trailGrad.addColorStop(1, 'rgba(255,180,40,0.55)');
      ctx.fillStyle = trailGrad;
      ctx.beginPath();
      ctx.ellipse(cx, y - 12, w * 0.3, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Glow halo
    ctx.save();
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
    glow.addColorStop(0, 'rgba(255,160,40,0.5)');
    glow.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rock body
    ctx.fillStyle   = '#78909c';
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.44, h * 0.44, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hot crack
    ctx.strokeStyle = '#ff7043';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.1, cy - h * 0.2);
    ctx.lineTo(cx + w * 0.15, cy + h * 0.15);
    ctx.stroke();
  }

  /** Type 1 — swooping dark bird */
  _drawBird(ctx) {
    const { x, y, width: w, height: h } = this;
    const cx   = x + w / 2, cy = y + h / 2;
    const flapY = Math.sin(this._wobble * 3) * h * 0.18;   // wing flap

    ctx.fillStyle   = '#37474f';
    ctx.strokeStyle = '#263238';
    ctx.lineWidth   = 1.5;

    // Body
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.3, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left wing
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.05, cy);
    ctx.quadraticCurveTo(cx - w * 0.3, cy - h * 0.3 - flapY, cx - w * 0.5, cy - h * 0.15 - flapY);
    ctx.quadraticCurveTo(cx - w * 0.3, cy + h * 0.05,        cx - w * 0.05, cy);
    ctx.fill();
    ctx.stroke();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.05, cy);
    ctx.quadraticCurveTo(cx + w * 0.3, cy - h * 0.3 - flapY, cx + w * 0.5, cy - h * 0.15 - flapY);
    ctx.quadraticCurveTo(cx + w * 0.3, cy + h * 0.05,        cx + w * 0.05, cy);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.arc(cx + w * 0.18, cy - h * 0.06, 3, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.28, cy);
    ctx.lineTo(cx + w * 0.44, cy + h * 0.06);
    ctx.lineTo(cx + w * 0.28, cy + h * 0.1);
    ctx.closePath();
    ctx.fill();
  }
}
