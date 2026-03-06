# 🎂 Endless Runner — A Birthday Gift

This is a hand-crafted endless runner game made with love as a **birthday gift for a very special friend**. 🎉

Open `index.html` in any browser and enjoy the ride!

---

## 🎮 How to Play

| Action | Control |
|--------|---------|
| Jump   | `Space` / `↑` arrow key |
| Jump   | Tap or click the screen (mobile friendly) |
| Start / Restart | Press `Space`, tap, or click the button |

Dodge every obstacle for as long as you can — the game gets faster over time. Beat your best score!

---

## ✨ Features

- **Stick-figure character** with your face as the head 🙂
- **5 ground obstacles** — cactus, boulder, log, fence, and mushroom
- **2 aerial obstacles** — a falling meteor and a swooping bird
- **Background music** that loops automatically
- **Responsive design** — plays on desktop and mobile
- **Scrolling parallax** sky, clouds, and ground
- **Difficulty ramp-up** — speed increases the longer you survive
- **Best score** tracking for the session

---

## 📁 Project Structure

```
├── index.html          # Main page
├── style.css           # All styling & responsive layout
├── assets/
│   ├── character.png   # The player's face (the birthday person!)
│   ├── bg-music.mp3    # Background music loop
│   ├── obstacle1.svg   # Cactus
│   ├── obstacle2.svg   # Boulder
│   ├── obstacle3.svg   # Log
│   ├── obstacle4.svg   # Fence
│   ├── obstacle5.svg   # Mushroom
│   ├── aerial1.svg     # Meteor
│   └── aerial2.svg     # Bird
└── js/
    ├── config.js           # All tunable constants (physics, sizes, colours)
    ├── utils.js            # Shared helpers (collision, random, drawing)
    ├── assets.js           # Image loader with canvas fallback
    ├── cloud.js            # Cloud class (parallax background)
    ├── player.js           # Player class (stick figure + face head)
    ├── groundObstacle.js   # GroundObstacle class (5 types)
    ├── aerialObstacle.js   # AerialObstacle class (2 types)
    ├── background.js       # Background rendering function
    └── game.js             # Main game loop, state, input, init
```

---

## 🛠️ Customisation

Everything tuneable lives in [`js/config.js`](js/config.js):

- **Swap the character face** → change `CONFIG.IMAGES.CHARACTER`
- **Replace obstacle images** → update the paths in `CONFIG.IMAGES.GROUND_OBSTACLES` / `AERIAL_OBSTACLES`
- **Adjust physics** (gravity, jump force) → `CONFIG.PHYSICS`
- **Tweak difficulty** (speed, spawn rate) → `CONFIG.DIFFICULTY`
- **Change colours** → `CONFIG.BG`

---

## 🚀 Running Locally

Because the game uses ES modules (`type="module"`), it needs to be served over HTTP — simply opening `index.html` as a `file://` URL won't work.

**Quick options:**

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

---

*Made with ❤️ — Happy Birthday! 🎈*
# paola-s-game-gift
