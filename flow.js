function startHammerSmashSequence() {
  if (hammerSmashActive) return;

  hammerVisible = true;
  hammerAnimationMode = 'smash';
  vialBroken = false;
  hammerSmashActive = true;
  hammerSmashStartedAt = millis();
}

function startHammerDropAwaySequence() {
  if (hammerSmashActive) return;

  hammerVisible = true;
  hammerAnimationMode = 'drop-away';
  vialBroken = false;
  hammerSmashActive = true;
  hammerSmashStartedAt = millis();
}

function resetToLevel1State(randomizeMouse = true) {
  currentScene = 1;

  lookedInBox = false;
  hasCheckedBox = false;
  scene2LookedInBox = false;
  scene2CatStatus = 'alive';

  wrongConsoleObj = null;
  correctConsoleObj = null;

  hammerVisible = true;
  pendingScene2At = 0;
  hammerSmashActive = false;
  hammerSmashStartedAt = 0;
  hammerAnimationMode = 'smash';
  vialBroken = false;

  scene2WakeActive = false;
  scene2WakeStartedAt = 0;

  interactionPoints = 0;
  infoVisible = true;
  pressedKeys = [];

  if (randomizeMouse) {
    mouseStatus = random() < 0.5 ? 'alive' : 'dead';
  }

  placePlayerInRoom();
  boxObj.x = width / 2;
  boxObj.y = height / 2;
  updateConsoles();

  vialObj.x = wallThickness + vialObj.w + 12;
  vialObj.y = height - wallThickness - vialObj.h / 2 - 12;
  hammerObj.x = vialObj.x + vialObj.w + 18 + hammerObj.handleLen / 2;
  hammerObj.y = vialObj.y;
}

function startGameFromMenu() {
  resetToLevel1State(true);
  gameState = 'playing';
  startPanel.hide();
  hideOutroPanel();
  startMusicFromUserGesture();
}

function playAgainFromOutro() {
  resetToLevel1State(true);
  gameState = 'playing';
  startPanel.hide();
  hideOutroPanel();
  restartMenuOutroMusicOnNextPlay = true;
  startMusicFromUserGesture();
}

function goToMenuFromOutro() {
  resetToLevel1State(true);
  gameState = 'start';
  hideOutroPanel();
  startPanel.show();
  syncMusicStateForCurrentScene();
}

function openAttributionsFromMenu() {
  gameState = 'attributions';
  startPanel.hide();
  hideOutroPanel();
  syncMusicStateForCurrentScene();
}

function returnToMenuFromAttributions() {
  gameState = 'start';
  startPanel.show();
  hideOutroPanel();
  syncMusicStateForCurrentScene();
}
