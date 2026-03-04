// general game globals and helpers

// game state: 'start' or 'playing' etc.
let gameState = 'start';
let currentScene = 1;

// player object holds position, radius and speed
let player = {
  x: 0,
  y: 0,
  radius: 20,
  speed: 4
};

// box object the player can interact with
let boxObj = {
  x: 0,
  y: 0,
  size: 100
};

// vial object (poison flask) to draw in the room
let vialObj = {
  x: 0,
  y: 0,
  // larger by default
  w: 66,
  h: 106
};
// hammer object (placed to the right of the vial)
let hammerObj = {
  x: vialObj.x + vialObj.w, // Positioning hammer to the right of the vial
  y: 0,
  handleLen: 78,
  handleW: 10,
  headW: 36,
  headH: 22
};

// door positioning and dimensions
// (Door removed — room will be closed)



// boolean flag set when player looks in box
let lookedInBox = false;
let hasCheckedBox = false;

// scene 2 box state (cat outcome depends on level 1 path)
let scene2LookedInBox = false;
let scene2CatStatus = 'alive'; // 'alive' or 'dead'

// wrong answer popup state (stays until player moves away from the pressed button)
let wrongConsoleObj = null;
let correctConsoleObj = null;

// scene-1 transition helper for Both/neither path
let hammerVisible = true;
let pendingScene2At = 0;

// hammer smash sequence when correct answer is given after checking the box
let hammerSmashActive = false;
let hammerSmashStartedAt = 0;
let hammerAnimationMode = 'smash'; // 'smash' | 'drop-away'
const HAMMER_SMASH_DURATION = 700;
const EXTRA_SCENE_SHIFT_DELAY = 0;
let vialBroken = false;

// mouse status: determined randomly at game start, stays the same throughout session
let mouseStatus = 'alive'; // 'alive' or 'dead'

// info overlay toggle (opened/closed with ESCAPE key)
let infoVisible = true;

// background music configuration/state
const GAMEPLAY_MUSIC_FILE_PATH = 'assets/audio/bensound-enigmatic.mp3';
const MENU_OUTRO_MUSIC_FILE_PATH = 'assets/audio/bensound-sleepless.mp3';
const MUSIC_ATTRIBUTION_TEXT = 'Music by Benjamin Tissot (Bensound) • License code: ND1RUAAXDVWT4555 • https://www.bensound.com/free-music-for-videos';
const MUSIC_ATTRIBUTION_TEXT_2 = 'Music by Diffie Bosman (Bensound) • License code: TT5GZWM1WTTH3EQE • https://www.bensound.com/free-music-for-videos';
const SOUND_ICON_FILE_PATH = 'assets/icons/volume-up.png';
let backgroundMusic = null;
let musicStartedByUser = true;
let musicVolume = 0.18;
let musicSliderDragging = false;
let soundIconImage = null;
let restartMenuOutroMusicOnNextPlay = false;

// score: +1 each time player interacts with an interactable object
let interactionPoints = 0;

// initial overlay text shown at game start
const INTRO_HEADER = 'LEVEL 1';
const INTRO_BODY = `Context
Inside the brown crate in the center of the room is a radioactive atom, a geiger counter, a hammer, a vial of deadly poison, and a mouse.

There is a 50% chance that the radioactive atom has decayed and a 50% chance that it has not.

If the atom is decayed, the hammer will break the vial and kill the mouse. If the radioactive atom has not decayed, the vial remains intact, and the mouse will be alive.

Is the mouse inside the box dead or alive?`;

const LEVEL2_HEADER = 'LEVEL 2';
const LEVEL2_BODY = `Context
Professor Erwin Schrödinger asked you a question!

Is the cat inside the crate dead or alive?`;

const SCENE2_WAKE_TEXT = 'You wake up from your daydream because someone asked you a question';
const SCENE2_WAKE_HOLD_DURATION = 2200;
const SCENE2_WAKE_FADE_DURATION = 1800;
let scene2WakeActive = false;
let scene2WakeStartedAt = 0;
// footer text removed; overlay controlled by ESCAPE key
// const INTRO_FOOTER = 'Press SPACE to play.';

// starfield background
const STAR_COUNT = 200;
let stars = [];

function createStars(n) {
  stars = [];
  for (let i = 0; i < n; i++) {
    stars.push(new Star());
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.speed = random(0.2, 1);
  }
  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = 0;
      this.x = random(width);
    }
  }
  draw() {
    noStroke();
    fill(255);
    circle(this.x, this.y, this.size);
  }
}

// wall and corridor configuration (shared across files)
let wallThickness = 140; // increased thickness so door sits within wall
const CORRIDOR_WIDTH = 200;

// consoles (Alive / Dead / Both/neither) configuration
let consoles = [
  { x: 0, y: 0, w: 100, h: 100, label: 'Alive' },
  { x: 0, y: 0, w: 100, h: 100, label: 'Both/neither' },
  { x: 0, y: 0, w: 100, h: 100, label: 'Either or' },
  { x: 0, y: 0, w: 100, h: 100, label: 'Dead' }
];

function updateConsoles() {
  let buttonRadius = consoles[0].w / 2;
  let topSafeY = wallThickness + buttonRadius + 16;
  let preferredY = height * 0.23;
  let bottomSafeY = height - wallThickness - boxObj.size / 2 - buttonRadius - 24;
  let buttonY = constrain(preferredY, topSafeY, max(topSafeY, bottomSafeY));

  let roomInnerWidth = width - wallThickness * 2;
  let buttonCount = consoles.length;
  let spacing = roomInnerWidth / (buttonCount + 1);
  let safeLeft = wallThickness + buttonRadius + 12;
  let safeRight = width - wallThickness - buttonRadius - 12;

  for (let i = 0; i < buttonCount; i++) {
    let x = wallThickness + spacing * (i + 1);
    consoles[i].x = constrain(x, safeLeft, safeRight);
    consoles[i].y = buttonY;
  }
}
