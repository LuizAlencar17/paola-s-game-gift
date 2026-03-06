/* =============================================================================
   CONFIG — all tunable constants in one place.
   Import this wherever you need a game constant.
============================================================================= */

export const CONFIG = {

  // ── Image paths ──────────────────────────────────────────
  IMAGES: {
    CHARACTER: 'assets/character.png',

    // 5 ground obstacle image paths
    GROUND_OBSTACLES: [
      'assets/obstacle1.png',   // type 0 – cactus
      'assets/obstacle2.png',   // type 1 – boulder
      'assets/obstacle3.png',   // type 2 – log
      'assets/obstacle4.png',   // type 3 – fence
      'assets/obstacle5.png',   // type 4 – mushroom
    ],

    // 2 aerial obstacle image paths
    AERIAL_OBSTACLES: [
      'assets/aerial1.svg',     // type 0 – falling meteor
      'assets/aerial2.svg',     // type 1 – swooping bird
    ],
  },

  // ── Canvas / layout ───────────────────────────────────────
  CANVAS: {
    WIDTH:  800,
    HEIGHT: 380,
  },

  // Y-coordinate of the ground surface (pixels from top)
  GROUND_Y: 253,

  // Fixed horizontal position of the player (left edge of hitbox)
  PLAYER_X: 100,

  // ── Stick figure dimensions ───────────────────────────────
  PLAYER: {
    HEAD_RADIUS: 30,     // px — face image is drawn inside this circle
    TORSO_LEN:   11,    // px — collar-bone to hip
    UPPER_ARM:   8,     // px — shoulder to elbow
    LOWER_ARM:   7,     // px — elbow to wrist
    UPPER_LEG:   10,    // px — hip to knee
    LOWER_LEG:   9,     // px — knee to foot
    WIDTH:       21,    // px — bounding box width (for collision)
  },

  // ── Ground obstacle base sizes (px). Each type scales ±20 %. ──
  GROUND_OBSTACLE_TYPES: [
    { width: 44, height: 72 },   // 0 – cactus
    { width: 56, height: 52 },   // 1 – boulder
    { width: 70, height: 38 },   // 2 – log
    { width: 36, height: 66 },   // 3 – fence
    { width: 48, height: 58 },   // 4 – mushroom
  ],

  // ── Aerial obstacle base sizes (px) ──────────────────────
  AERIAL_OBSTACLE_TYPES: [
    { width: 44, height: 40 },   // 0 – meteor
    { width: 56, height: 36 },   // 1 – bird
  ],

  // Hover heights (px above GROUND_Y) for aerial obstacles
  AERIAL_HOVER_RANGE: { MIN: 55, MAX: 110 },

  // ── Physics ───────────────────────────────────────────────
  PHYSICS: {
    GRAVITY:           0.55,
    JUMP_FORCE:       -16,
    AERIAL_FALL_SPEED: 2.2,
  },

  // ── Difficulty ramp-up ────────────────────────────────────
  DIFFICULTY: {
    INITIAL_SPEED:    5,
    MAX_SPEED:       14,
    SPEED_PER_FRAME:  0.0008,

    GROUND_SPAWN_MIN_MS:  750,
    GROUND_SPAWN_MAX_MS: 2400,

    AERIAL_SPAWN_MIN_MS: 3000,
    AERIAL_SPAWN_MAX_MS: 7000,
  },

  // ── Scoring ───────────────────────────────────────────────
  SCORE: {
    PER_FRAME: 0.1,
  },

  // ── Hitbox inset (px on each side) ─────────────────────────
  HITBOX_SHRINK: 9,

  // ── Background colours ────────────────────────────────────
  BG: {
    SKY_TOP:     '#6ec6f0',
    SKY_BOTTOM:  '#d4eeff',
    GROUND:      '#5a8a3c',
    GROUND_EDGE: '#4a7032',
    DIRT:        '#c8a96e',
    NUM_CLOUDS:  5,
    CLOUD_SPEED: 0.8,
  },
};
