/* =============================================================================
   PLAYER — stick figure with face-image head, jump, squash/stretch.
============================================================================= */
import { CONFIG } from './config.js';
import { IMAGES } from './assets.js';

export class Player {
  constructor() {
    const P = CONFIG.PLAYER;

    // Compute total body height from individual segment lengths
    const headDiam    = P.HEAD_RADIUS * 2;
    const neckLen     = 6;
    const totalHeight = headDiam + neckLen + P.TORSO_LEN + P.UPPER_LEG + P.LOWER_LEG + 2;

    this.width      = P.WIDTH;
    this.height     = totalHeight;                     // ~106 px
    this.x          = CONFIG.PLAYER_X;
    this.groundY    = CONFIG.GROUND_Y - this.height;   // resting top-Y
    this.y          = this.groundY;

    this.velocityY  = 0;
    this.isOnGround = true;

    // Squash & stretch
    this.scaleX = 1;
    this.scaleY = 1;
    this._landingTimer = 0;

    // Limb animation
    this._limbAngle = 0;    // oscillates for running cycle
    this._limbSpeed = 0.22;
  }

  /** Trigger a jump if the player is currently on the ground. */
  jump() {
    if (this.isOnGround) {
      this.velocityY  = CONFIG.PHYSICS.JUMP_FORCE;
      this.isOnGround = false;
    }
  }

  /** Apply gravity, update position, and advance animations each frame. */
  update() {
    if (!this.isOnGround) {
      this.velocityY += CONFIG.PHYSICS.GRAVITY;
      this.y         += this.velocityY;

      if (this.y >= this.groundY) {
        this.y             = this.groundY;
        this.velocityY     = 0;
        this.isOnGround    = true;
        this._landingTimer = 8;
      }
    }

    // ── Squash & stretch ──────────────────────────────────
    if (this._landingTimer > 0) {
      this.scaleX = 1.25;
      this.scaleY = 0.78;
      this._landingTimer--;
    } else if (!this.isOnGround) {
      if (this.velocityY < 0) { this.scaleX = 0.84; this.scaleY = 1.18; }
      else                    { this.scaleX = 1.06; this.scaleY = 0.95; }
    } else {
      this.scaleX += (1 - this.scaleX) * 0.2;
      this.scaleY += (1 - this.scaleY) * 0.2;
    }

    // Advance running cycle only while on the ground
    if (this.isOnGround) this._limbAngle += this._limbSpeed;
  }

  /**
   * Draw the full stick figure.
   *
   * Layout (relative to bounding-box top):
   *   Top of head  → y = 0
   *   Head centre  → y = HEAD_RADIUS
   *   Collar       → y = HEAD_RADIUS*2 + neckLen
   *   Hip          → y = collar + TORSO_LEN
   *   Knee         → y = hip   + UPPER_LEG
   *   Foot         → y = knee  + LOWER_LEG
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const P      = CONFIG.PLAYER;
    const cx     = this.x + this.width / 2;   // horizontal centre
    const top    = this.y;                    // top of bounding box

    // Key Y landmarks (absolute canvas coords)
    const headCY  = top + P.HEAD_RADIUS;
    const neckY   = top + P.HEAD_RADIUS * 2 + 4;
    const collarY = neckY + 4;
    const hipY    = collarY + P.TORSO_LEN;
    const swing   = Math.sin(this._limbAngle);   // -1 … +1

    ctx.save();

    // Apply squash/stretch around the figure's centre of mass
    const pivotY = top + this.height / 2;
    ctx.translate(cx, pivotY);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-cx, -pivotY);

    // ── LIMBS (drawn behind torso and head) ─────────────────
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';

    const armSwing = swing * 0.55;   // shoulder rotation (radians)
    const legSwing = swing * 0.48;

    /**
     * Draw a two-segment limb (upper + lower).
     * @param {number} ox      - origin X
     * @param {number} oy      - origin Y
     * @param {number} angle   - rotation of upper segment from vertical
     * @param {number} uLen    - upper segment length
     * @param {number} lLen    - lower segment length
     * @param {number} bendDir - +1 or -1 (direction of knee/elbow bend)
     */
    const drawLimb = (ox, oy, angle, uLen, lLen, bendDir) => {
      const ex = ox + Math.sin(angle) * uLen;
      const ey = oy + Math.cos(angle) * uLen;
      const ba = angle + bendDir * 0.4;          // slight bend at joint
      const fx = ex + Math.sin(ba) * lLen;
      const fy = ey + Math.cos(ba) * lLen;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ex, ey);
      ctx.lineTo(fx, fy);
      ctx.stroke();
    };

    ctx.strokeStyle = '#2c2c2c';
    ctx.lineWidth   = 3;

    // Left arm (opposite phase)
    drawLimb(cx - 6, collarY, -armSwing - 0.1, P.UPPER_ARM, P.LOWER_ARM, -1);
    // Right arm
    drawLimb(cx + 6, collarY,  armSwing + 0.1, P.UPPER_ARM, P.LOWER_ARM,  1);
    // Left leg
    drawLimb(cx - 5, hipY,    -legSwing - 0.05, P.UPPER_LEG, P.LOWER_LEG, -1);
    // Right leg
    drawLimb(cx + 5, hipY,     legSwing + 0.05, P.UPPER_LEG, P.LOWER_LEG,  1);

    // ── TORSO ─────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(cx, neckY);
    ctx.lineTo(cx, hipY);
    ctx.stroke();

    // ── HEAD: face image clipped to a circle ──────────────
    const hr = P.HEAD_RADIUS;

    if (IMAGES.character) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, headCY, hr, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(IMAGES.character, cx - hr, headCY - hr, hr * 2, hr * 2);
      ctx.restore();
    } else {
      // ── Fallback: canvas-drawn face ─────────────────────
      ctx.fillStyle   = '#FFD093';
      ctx.strokeStyle = '#c8893a';
      ctx.lineWidth   = 1.8;
      ctx.beginPath();
      ctx.arc(cx, headCY, hr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#2a1800';
      ctx.beginPath();
      ctx.ellipse(cx - hr * 0.35, headCY - hr * 0.15, hr * 0.13, hr * 0.17, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + hr * 0.35, headCY - hr * 0.15, hr * 0.13, hr * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eye shine
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx - hr * 0.28, headCY - hr * 0.22, hr * 0.05, 0, Math.PI * 2);
      ctx.arc(cx + hr * 0.42, headCY - hr * 0.22, hr * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.strokeStyle = '#a06020';
      ctx.lineWidth   = 1.8;
      ctx.beginPath();
      ctx.arc(cx, headCY + hr * 0.1, hr * 0.38, 0.25, Math.PI - 0.25);
      ctx.stroke();
      // Blush
      ctx.fillStyle = 'rgba(255,140,140,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx - hr * 0.6, headCY + hr * 0.2, hr * 0.18, hr * 0.1, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + hr * 0.6, headCY + hr * 0.2, hr * 0.18, hr * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /** Axis-aligned bounding box for collision checks. */
  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}
