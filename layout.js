function windowResized() {
  // holder canvas i fuld størrelse når vinduet ændres
  resizeCanvas(windowWidth, windowHeight);

  updateResponsiveLayoutMetrics();

  // positionen af stjernerne er relativ til canvas størrelse, så de kan genberegnes
  createStars(STAR_COUNT);

  // placér aktiver i rummet på nytt hvis størrelsen ændrer sig
  if (currentScene === 2) {
    placePlayerAtCorridorStart();
  } else {
    placePlayerInRoom();
  }
  boxObj.x = width / 2;
  boxObj.y = height / 2;
  updateConsoles();
  // flyt hætteglasset til nederste venstre hjørne ved resize
  vialObj.x = wallThickness + vialObj.w + 12;
  vialObj.y = height - wallThickness - vialObj.h / 2 - 12;
  // flyt også hammeren
  hammerObj.x = vialObj.x + vialObj.w + 18 + hammerObj.handleLen / 2;
  hammerObj.y = vialObj.y;

  //  positionen af UI elementerne kan også justeres hvis nødvendigt
  windowResizedUI();
}

function updateResponsiveLayoutMetrics() {
  let minDim = min(width, height);

  wallThickness = constrain(minDim * 0.13, 88, 170);

  player.radius = constrain(minDim * 0.022, 14, 24);
  player.speed = constrain(player.radius * 0.22, 3, 5.5);

  boxObj.size = constrain(minDim * 0.1, 70, 120);

  vialObj.w = constrain(minDim * 0.055, 40, 68);
  vialObj.h = constrain(minDim * 0.092, 68, 112);

  let consoleSize = constrain(minDim * 0.098, 74, 108);
  for (let c of consoles) {
    c.w = consoleSize;
    c.h = consoleSize;
  }
}

function getBottomCorridorBounds() {
  let corridorWidth = constrain(width * 0.18, 140, 260);
  return {
    x: width / 2 - corridorWidth / 2,
    w: corridorWidth
  };
}

function placePlayerAtCorridorStart() {
  let corridor = getBottomCorridorBounds();
  player.x = corridor.x + corridor.w / 2;
  player.y = height - wallThickness - player.radius - 8;
}

function placePlayerInRoom() {
  player.x = width / 2;
  player.y = height - wallThickness - player.radius - 10;
}

function processPendingSceneShift() {
  if (pendingScene2At === 0) return;
  if (millis() < pendingScene2At) return;

  pendingScene2At = 0;
  currentScene = 2;
  scene2LookedInBox = false;
  scene2HasCheckedBox = false;
  infoVisible = true;
  startScene2WakeSequence();
  placePlayerAtCorridorStart();
}

function startScene2WakeSequence() {
  scene2WakeActive = true;
  scene2WakeStartedAt = millis();
}

function processScene2WakeSequence() {
  if (!scene2WakeActive) return;

  let elapsed = millis() - scene2WakeStartedAt;
  let totalDuration = SCENE2_WAKE_HOLD_DURATION + SCENE2_WAKE_FADE_DURATION;
  if (elapsed >= totalDuration) {
    scene2WakeActive = false;
    infoVisible = true;
  }
}

function processHammerSmashSequence() {
  if (!hammerSmashActive) return;

  let elapsedMs = millis() - hammerSmashStartedAt;
  let t = constrain(elapsedMs / HAMMER_SMASH_DURATION, 0, 1);
  let baseBreakMs = HAMMER_SMASH_DURATION * 0.62;
  let breakTriggerMs = max(0, baseBreakMs - HAMMER_GLASS_BREAK_ADVANCE_MS);

  if (hammerAnimationMode === 'smash' && elapsedMs >= breakTriggerMs && !vialBroken) {
    vialBroken = true;
    playGlassBreakSfx();
  }

  if (t >= 1) {
    hammerSmashActive = false;
    if (hammerAnimationMode === 'drop-away') {
      hammerVisible = false;
    }
    pendingScene2At = millis() + 450 + EXTRA_SCENE_SHIFT_DELAY;
  }
}
