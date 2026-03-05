// Generelle variabler og konstanter for spillet

// spiltilstand: 'start' eller 'playing' osv.
let gameState = 'start';
let currentScene = 1;

// spiller-objekt med position, radius og hastighed
let player = {
  x: 0,
  y: 0,
  radius: 20,
  speed: 4
};

// kasse-objekt som spilleren kan interagere med
let boxObj = {
  x: 0,
  y: 0,
  size: 100
};

// hætteglas-objekt (giftflaske), som tegnes i rummet
let vialObj = {
  x: 0,
  y: 0,
  // større som standard
  w: 66,
  h: 106
};
// hammer-objekt (placeret til højre for hætteglasset)
let hammerObj = {
  x: vialObj.x + vialObj.w, // Placerer hammeren til højre for hætteglasset
  y: 0,
  handleLen: 78,
  handleW: 10,
  headW: 36,
  headH: 22
};

// dørens placering og dimensioner
// (Dør fjernet — rummet er lukket)



// boolsk flag der sættes, når spilleren kigger i kassen
let lookedInBox = false;
let hasCheckedBox = false;

// kassens tilstand i scene 2 (kattens udfald afhænger af valg i level 1)
let scene2LookedInBox = false;
let scene2CatStatus = 'alive'; // 'alive' eller 'dead'

// tilstand for forkert-svar-popup (bliver vist indtil spilleren går væk fra den trykkede knap)
let wrongConsoleObj = null;
let correctConsoleObj = null;

// scene 1-overgangshjælp til Both/neither-stien
let hammerVisible = true;
let pendingScene2At = 0;

// hammer-knuse-sekvens når korrekt svar gives efter at have kigget i kassen
let hammerSmashActive = false;
let hammerSmashStartedAt = 0;
let hammerAnimationMode = 'smash'; // 'smash' | 'drop-away'
const HAMMER_SMASH_DURATION = 700;
const HAMMER_GLASS_BREAK_ADVANCE_MS = 500;
const EXTRA_SCENE_SHIFT_DELAY = 1500;
let vialBroken = false;

// musens tilstand: bestemmes tilfældigt ved spilstart og forbliver den samme i hele sessionen
let mouseStatus = 'alive'; // 'alive' eller 'dead'

// skift af info-overlay (åbnes/lukkes med ESCAPE-tasten)
let infoVisible = true;

// konfiguration/tilstand for baggrundsmusik
const GAMEPLAY_MUSIC_FILE_PATH = 'assets/audio/bensound-enigmatic.mp3';
const MENU_OUTRO_MUSIC_FILE_PATH = 'assets/audio/bensound-sleepless.mp3';
const GLASS_BREAK_SFX_FILE_PATH = 'assets/audio/dragon-studio-glass-breaking-386153.mp3';
const THUD_IMPACT_SFX_FILE_PATH = 'assets/audio/Virtual_vibes-thud-impact-sound-sfx-379990.mp3';
const MUSIC_ATTRIBUTION_TEXT = 'Music by Benjamin Tissot (Bensound) • License code: ND1RUAAXDVWT4555 • https://www.bensound.com/free-music-for-videos';
const MUSIC_ATTRIBUTION_TEXT_2 = 'Music by Diffie Bosman (Bensound) • License code: TT5GZWM1WTTH3EQE • https://www.bensound.com/free-music-for-videos';
const SOUND_ICON_FILE_PATH = 'assets/icons/volume-up.png';
let backgroundMusic = null;
let glassBreakSfx = null;
let thudImpactSfx = null;
let musicStartedByUser = true;
let musicVolume = 0.18;
let musicSliderDragging = false;
let soundIconImage = null;
let restartMenuOutroMusicOnNextPlay = false;

// score: +1 hver gang spilleren interagerer med et interagerbart objekt
let interactionPoints = 0;

// indledende overlay-tekst vist ved spilstart
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
// footertekst fjernet; overlay styres med ESCAPE-tasten
// const INTRO_FOOTER = 'Press SPACE to play.';

// stjernefelt-baggrund
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

// konfiguration af vægge og korridor (delt på tværs af filer)
let wallThickness = 140; // øget tykkelse så døren ligger inden for væggen
const CORRIDOR_WIDTH = 200;

// konfiguration af konsoller (Alive / Dead / Both/neither)
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
