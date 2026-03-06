/* =============================================================================
   GAME — main entry point.
   Imports all modules, owns the canvas/context, manages game state, and
   drives the game loop.
============================================================================= */
import { CONFIG }          from './config.js';
import { loadImage, IMAGES } from './assets.js';
import { rectsOverlap, randInt, lerp } from './utils.js';
import { Cloud }           from './cloud.js';
import { Player }          from './player.js';
import { GroundObstacle }  from './groundObstacle.js';
import { AerialObstacle }  from './aerialObstacle.js';
import { drawBackground }  from './background.js';


/* ============================================================
   Canvas setup
   ============================================================ */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

canvas.width  = CONFIG.CANVAS.WIDTH;
canvas.height = CONFIG.CANVAS.HEIGHT;


/* ============================================================
   Game state — variables that reset on every new round
   ============================================================ */
let state            = 'start';   // 'start' | 'playing' | 'gameover'
let player           = null;
let groundObstacles  = [];
let aerialObstacles  = [];
let clouds           = [];
let gameSpeed        = CONFIG.DIFFICULTY.INITIAL_SPEED;
let score            = 0;
let bestScore        = 0;
let frameCount       = 0;
let groundScrollX    = 0;
let groundSpawnTimer = 0;         // ms until next ground obstacle
let aerialSpawnTimer = 0;         // ms until next aerial obstacle
let lastTime         = 0;
let animFrameId      = null;


/* ============================================================
   Difficulty — speed & spawn-rate ramp-up
   ============================================================ */

/** Increase scroll speed each frame, capped at MAX_SPEED. */
function updateDifficulty() {
  gameSpeed = Math.min(
    gameSpeed + CONFIG.DIFFICULTY.SPEED_PER_FRAME,
    CONFIG.DIFFICULTY.MAX_SPEED,
  );
}

/** Ground spawn interval shrinks as speed increases. */
function nextGroundSpawnInterval() {
  const maxMs = lerp(
    CONFIG.DIFFICULTY.GROUND_SPAWN_MAX_MS,
    CONFIG.DIFFICULTY.GROUND_SPAWN_MIN_MS * 1.6,
    (gameSpeed - CONFIG.DIFFICULTY.INITIAL_SPEED) /
    (CONFIG.DIFFICULTY.MAX_SPEED - CONFIG.DIFFICULTY.INITIAL_SPEED),
  );
  return randInt(
    CONFIG.DIFFICULTY.GROUND_SPAWN_MIN_MS,
    Math.max(CONFIG.DIFFICULTY.GROUND_SPAWN_MIN_MS + 50, maxMs),
  );
}

/** Aerial spawn interval, less frequent than ground. */
function nextAerialSpawnInterval() {
  const maxMs = lerp(
    CONFIG.DIFFICULTY.AERIAL_SPAWN_MAX_MS,
    CONFIG.DIFFICULTY.AERIAL_SPAWN_MIN_MS * 1.4,
    (gameSpeed - CONFIG.DIFFICULTY.INITIAL_SPEED) /
    (CONFIG.DIFFICULTY.MAX_SPEED - CONFIG.DIFFICULTY.INITIAL_SPEED),
  );
  return randInt(
    CONFIG.DIFFICULTY.AERIAL_SPAWN_MIN_MS,
    Math.max(CONFIG.DIFFICULTY.AERIAL_SPAWN_MIN_MS + 100, maxMs),
  );
}


/* ============================================================
   Collision detection
   ============================================================ */

/** Returns true if the player overlaps any active obstacle. */
function checkCollisions() {
  const pb = player.getBounds();
  const sh = CONFIG.HITBOX_SHRINK;
  for (const obs of groundObstacles) {
    if (rectsOverlap(pb, obs.getBounds(), sh)) return true;
  }
  for (const obs of aerialObstacles) {
    if (rectsOverlap(pb, obs.getBounds(), sh)) return true;
  }
  return false;
}


/* ============================================================
   Score
   ============================================================ */
const scoreValueEl = document.getElementById('score-value');
const bestValueEl  = document.getElementById('best-value');
const finalScoreEl = document.getElementById('final-score');
const finalBestEl  = document.getElementById('final-best');

function updateScore(deltaMs) {
  score += CONFIG.SCORE.PER_FRAME * (deltaMs / 16.67);
  const display = Math.floor(score);
  scoreValueEl.textContent = display;
  if (display > bestScore) {
    bestScore = display;
    bestValueEl.textContent = bestScore;
  }
}


/* ============================================================
   Main game loop
   ============================================================ */

/**
 * Core loop — called every animation frame via requestAnimationFrame.
 * @param {DOMHighResTimeStamp} timestamp
 */
function gameLoop(timestamp) {
  if (state !== 'playing') return;

  // Delta time — cap at 100 ms to avoid huge jumps after tab switches
  const deltaMs = Math.min(timestamp - lastTime, 100);
  lastTime      = timestamp;
  frameCount++;

  updateScore(deltaMs);
  updateDifficulty();

  // Scroll ground
  groundScrollX += gameSpeed;

  // Update clouds
  clouds.forEach(c => c.update(gameSpeed));

  // ── Spawn ground obstacles ────────────────────────────────
  groundSpawnTimer -= deltaMs;
  if (groundSpawnTimer <= 0) {
    groundObstacles.push(new GroundObstacle(gameSpeed));
    groundSpawnTimer = nextGroundSpawnInterval();
  }

  // ── Spawn aerial obstacles ────────────────────────────────
  aerialSpawnTimer -= deltaMs;
  if (aerialSpawnTimer <= 0) {
    aerialObstacles.push(new AerialObstacle(gameSpeed));
    aerialSpawnTimer = nextAerialSpawnInterval();
  }

  // ── Update & cull ground obstacles ───────────────────────
  for (let i = groundObstacles.length - 1; i >= 0; i--) {
    groundObstacles[i].update(gameSpeed);
    if (groundObstacles[i].isOffScreen()) groundObstacles.splice(i, 1);
  }

  // ── Update & cull aerial obstacles ───────────────────────
  for (let i = aerialObstacles.length - 1; i >= 0; i--) {
    aerialObstacles[i].update(gameSpeed);
    if (aerialObstacles[i].isOffScreen()) aerialObstacles.splice(i, 1);
  }

  // Update player
  player.update();

  // Collision check
  if (checkCollisions()) {
    endGame();
    return;
  }

  drawFrame();
  animFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Render one full frame:
 *   background → ground obstacles → aerial obstacles → player
 */
function drawFrame() {
  ctx.clearRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
  drawBackground(ctx, clouds, groundScrollX);
  groundObstacles.forEach(o => o.draw(ctx));
  aerialObstacles.forEach(o => o.draw(ctx));
  player.draw(ctx);
}


/* ============================================================
   UI management
   ============================================================ */
const startScreen    = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');

function showScreen(name) {
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  if (name === 'start')    startScreen.classList.remove('hidden');
  if (name === 'gameover') gameOverScreen.classList.remove('hidden');
}

function hideScreens() {
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
}


/* ============================================================
   Game lifecycle
   ============================================================ */

/** Reset all per-round state. Called at the start of every new round. */
function resetGame() {
  if (animFrameId) cancelAnimationFrame(animFrameId);

  gameSpeed        = CONFIG.DIFFICULTY.INITIAL_SPEED;
  score            = 0;
  frameCount       = 0;
  groundScrollX    = 0;
  groundObstacles  = [];
  aerialObstacles  = [];
  groundSpawnTimer = nextGroundSpawnInterval();
  aerialSpawnTimer = nextAerialSpawnInterval();

  scoreValueEl.textContent = '0';

  clouds = Array.from({ length: CONFIG.BG.NUM_CLOUDS }, (_, i) => {
    const x     = (CONFIG.CANVAS.WIDTH / CONFIG.BG.NUM_CLOUDS) * i + randInt(0, 80);
    const y     = randInt(15, 90);
    const scale = 0.5 + Math.random() * 0.9;
    return new Cloud(x, y, scale);
  });

  player = new Player();
}

/** Begin a new game round. */
function startGame() {
  resetGame();
  hideScreens();
  state       = 'playing';
  lastTime    = performance.now();
  animFrameId = requestAnimationFrame(gameLoop);
}

/** Triggered on collision — freeze game and show game-over screen. */
function endGame() {
  state = 'gameover';
  drawFrame();   // render final position
  finalScoreEl.textContent = Math.floor(score);
  finalBestEl.textContent  = bestScore;
  showScreen('gameover');
}


/* ============================================================
   Background music
   ============================================================ */
const bgMusic = new Audio('assets/bg-music.mp3');
bgMusic.loop   = true;
bgMusic.volume = 0.4;

// Try immediate autoplay; browsers may block it until a user gesture.
bgMusic.play().catch(() => {
  // Autoplay was blocked — start on first interaction instead.
  const unlockAudio = () => {
    bgMusic.play().catch(() => {});
    window.removeEventListener('keydown',    unlockAudio);
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('touchstart',  unlockAudio);
  };
  window.addEventListener('keydown',     unlockAudio, { once: true });
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('touchstart',  unlockAudio, { once: true });
});


/* ============================================================
   Input handling
   ============================================================ */

function handleJumpInput() {
  if      (state === 'playing')  player.jump();
  else if (state === 'gameover') startGame();
  else if (state === 'start')    startGame();
}

// Keyboard: Space or ArrowUp
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    handleJumpInput();
  }
});

// Touch (mobile) — fires on tap
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleJumpInput();
}, { passive: false });

// Mouse click on canvas — jump / start / restart
canvas.addEventListener('click', () => {
  handleJumpInput();
});

// Buttons
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);


/* ============================================================
   Initialisation — preload all assets then show start screen
   ============================================================ */
async function init() {
  const characterPromise = loadImage(CONFIG.IMAGES.CHARACTER);
  const groundPromises   = CONFIG.IMAGES.GROUND_OBSTACLES.map(loadImage);
  const aerialPromises   = CONFIG.IMAGES.AERIAL_OBSTACLES.map(loadImage);

  const [charImg, ...rest] = await Promise.all([
    characterPromise,
    ...groundPromises,
    ...aerialPromises,
  ]);

  IMAGES.character       = charImg;
  IMAGES.groundObstacles = rest.slice(0, CONFIG.IMAGES.GROUND_OBSTACLES.length);
  IMAGES.aerialObstacles = rest.slice(CONFIG.IMAGES.GROUND_OBSTACLES.length);

  resetGame();
  state = 'start';
  drawFrame();
  showScreen('start');
}

init();
