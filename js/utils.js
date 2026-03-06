/* =============================================================================
   UTILS — shared helper functions used across multiple modules.
============================================================================= */

/**
 * AABB collision test with an optional inset (hitbox shrink).
 * Returns true if the two rectangles overlap.
 *
 * @param {{ x, y, width, height }} a
 * @param {{ x, y, width, height }} b
 * @param {number} shrink - pixels to shrink each rect's hitbox
 */
export function rectsOverlap(a, b, shrink = 0) {
  return (
    a.x + shrink               < b.x + b.width  - shrink &&
    a.x + a.width  - shrink    > b.x             + shrink &&
    a.y + shrink               < b.y + b.height  - shrink &&
    a.y + a.height - shrink    > b.y             + shrink
  );
}

/** Returns a random integer between min and max (inclusive). */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Linear interpolation between a and b by factor t ∈ [0, 1]. */
export function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Cross-browser filled + stroked rounded rectangle.
 * Uses the native ctx.roundRect() when available, falls back to arcs.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    const cr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + cr, y);
    ctx.lineTo(x + w - cr, y);
    ctx.quadraticCurveTo(x + w, y,     x + w, y + cr);
    ctx.lineTo(x + w, y + h - cr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
    ctx.lineTo(x + cr, y + h);
    ctx.quadraticCurveTo(x,     y + h, x,     y + h - cr);
    ctx.lineTo(x, y + cr);
    ctx.quadraticCurveTo(x,     y,     x + cr, y);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
}

/**
 * Draw an image scaled to fit inside a bounding box while preserving its
 * natural aspect ratio ("contain" behaviour).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} img
 * @param {number} x       - left edge of the bounding box
 * @param {number} y       - top edge of the bounding box
 * @param {number} maxW    - bounding box width
 * @param {number} maxH    - bounding box height
 * @param {'bottom'|'center'} [align='bottom'] - vertical alignment inside the box
 */
export function drawImageContain(ctx, img, x, y, maxW, maxH, align = 'bottom') {
  const ratio  = img.naturalWidth / img.naturalHeight;
  let drawW, drawH;
  if (ratio > maxW / maxH) {
    drawW = maxW;
    drawH = maxW / ratio;
  } else {
    drawH = maxH;
    drawW = maxH * ratio;
  }
  const dx = x + (maxW - drawW) / 2;                              // centre horizontally
  const dy = align === 'bottom' ? y + (maxH - drawH) : y + (maxH - drawH) / 2;  // align vertically
  ctx.drawImage(img, dx, dy, drawW, drawH);
}
