let pressedKeys = [];

function setup() {
  // Canvas størrelse
  createCanvas(windowWidth, windowHeight);

  updateResponsiveLayoutMetrics();

  // normally start screen, gameState remains 'start'

  // Lav stjernerne i så de kan blive tegnet i draw()
  createStars(STAR_COUNT);

  // initialiser player ved starten af korridoren
  placePlayerInRoom();
  boxObj.x = width / 2;
  boxObj.y = height / 2;
  updateConsoles();
  // position the vial near the box (to the left of the box)
  // place vial in bottom-left corner inside the walls
  vialObj.x = wallThickness + vialObj.w + 12;
  vialObj.y = height - wallThickness - vialObj.h / 2 - 12;
  // place hammer to the right of the vial with some spacing
  hammerObj.x = vialObj.x + vialObj.w + 18 + hammerObj.handleLen / 2;
  hammerObj.y = vialObj.y;

  // lav UI elementerne (title screen, knapper,)
  setupUI();
  initSoundIconAsset();
  setupAudioSystem();
}

function draw() {
  // stjernerne er en del af baggrunden, så de tegnes uanset gameState;
  background(0);
  stars.forEach((s) => {
    s.update();
    s.draw();
  });

  if (gameState === 'playing') {
    if (currentScene === 1) {
      processHammerSmashSequence();

      // draw the room and objects first
      drawRoom();
      drawInteractionPoints();
      drawPlayer();
      // draw the info overlay if visible
      drawIntroOverlay();

      // player may move and interact regardless of overlay state
      updatePlayer();
      handleInteractionDisplay();
      drawWrongPopup();
      drawCorrectPopup();
      processPendingSceneShift();
      drawBottomRightHud();
    } else if (currentScene === 2) {
      drawScene2Placeholder();
      drawInteractionPoints();
      drawPlayer();
      drawWrongPopup();

      if (scene2WakeActive) {
        processScene2WakeSequence();
        drawScene2WakeOverlay();
      } else {
        drawIntroOverlay();
        updatePlayer();
        handleInteractionDisplay();
        drawBottomRightHud();
      }
    } else if (currentScene === 3) {
      drawOutroScenePlaceholder();
    }
  } else if (gameState === 'attributions') {
    drawAttributionsScene();
  }

  syncMusicStateForCurrentScene();
}
