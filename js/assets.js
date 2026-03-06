/* =============================================================================
   ASSETS — image loading with canvas fallback support.
============================================================================= */

/**
 * loadImage(src)
 * Returns a Promise that resolves with an HTMLImageElement.
 * If the file isn't found, resolves with null — drawing code falls back
 * to canvas shapes instead.
 *
 * @param {string} src
 * @returns {Promise<HTMLImageElement|null>}
 */
export function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => {
      console.warn(`[Endless Runner] Image not found: "${src}" — using fallback drawing.`);
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Populated during init() in game.js.
 * Exported as a mutable object so modules can read loaded images.
 */
export const IMAGES = {
  character:       null,
  groundObstacles: [null, null, null, null, null],
  aerialObstacles: [null, null],
};
