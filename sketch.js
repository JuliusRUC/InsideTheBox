let pressedKeys = [];

function setup() {
  // Canvas størrelse
  createCanvas(windowWidth, windowHeight);

  updateResponsiveLayoutMetrics();

  // starter normalt på startskærmen, spiltilstanden forbliver 'start'

  // lav stjernerne, så de kan blive tegnet i draw()
  createStars(STAR_COUNT);

  // initialiser spilleren ved starten af korridoren
  placePlayerInRoom();
  boxObj.x = width / 2;
  boxObj.y = height / 2;
  updateConsoles();
  // placér hætteglasset nær kassen (til venstre for kassen)
  // placér hætteglasset i nederste venstre hjørne inden for væggene
  vialObj.x = wallThickness + vialObj.w + 12;
  vialObj.y = height - wallThickness - vialObj.h / 2 - 12;
  // placér hammeren til højre for hætteglasset med lidt afstand
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

      // tegn rummet og objekterne først
      drawRoom();
      drawInteractionPoints();
      drawPlayer();
      // tegn info-overlayet hvis det er synligt
      drawIntroOverlay();

      // spilleren kan bevæge sig og interagere uanset overlayets tilstand
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
