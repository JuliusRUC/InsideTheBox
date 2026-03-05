
// UI er til funktioner der har med User Interface at gøre

let startPanel; // div til startskærmen, så vi kan skjule den når spillet starter
let startButton;
let attributionsButton;
let startSoundControl;
let startSoundIcon;
let startVolumeSlider;
let outroPanel;
let outroScoreText;
let outroFeedbackText;
let playAgainButton;
let menuButton;

/**
 * byg startskærmen ud fra hvad vi har called fra setup().
 */
function setupUI() {
  startPanel = createDiv();
  startPanel.addClass('start-panel');
  // AI hjælperen har lavet en fin startskærm til os, så vi kan bare bruge den
    startPanel.html(`
      <h1>Welcome to<br><span class="brand">Inside The Box</span></h1>
      <p>Complete the game with the least amount of points.</p>
      <p>Points are gained with every interaction</p>
      <p>Be observative and try to find the optimal path!</p>
      <div class="control-box">
        <h3>Controls</h3>
        <ul class="control-list">
          <li>Arrow Keys: move around</li>
          <li>Space: Interact</li>
          <li>Esc: Toggle informationbox on/off</li>
        </ul>
      </div>
    `);

  let menuButtons = createDiv();
  menuButtons.addClass('start-menu-buttons');
  menuButtons.parent(startPanel);

  startButton = createButton('Start Game');
  startButton.addClass('start-button');
  startButton.parent(menuButtons);

  startButton.mousePressed(() => {
    startGameFromMenu();
  });

  attributionsButton = createButton('Attributions');
  attributionsButton.addClass('start-button');
  attributionsButton.addClass('secondary-button');
  attributionsButton.parent(menuButtons);
  attributionsButton.mousePressed(() => {
    openAttributionsFromMenu();
  });

  setupStartSoundControl();

  setupOutroUI();
}

function setupStartSoundControl() {
  startSoundControl = createDiv();
  startSoundControl.addClass('start-sound-control');
  startSoundControl.parent(startPanel);

  startSoundIcon = createImg(SOUND_ICON_FILE_PATH, 'Sound icon');
  startSoundIcon.addClass('start-sound-icon');
  startSoundIcon.parent(startSoundControl);

  startVolumeSlider = createSlider(0, 100, round(musicVolume * 100), 1);
  startVolumeSlider.addClass('start-sound-slider');
  startVolumeSlider.parent(startSoundControl);
  startVolumeSlider.input(() => {
    startMusicFromUserGesture();
    setMusicVolume(startVolumeSlider.value() / 100);
  });
}

function syncStartVolumeSlider() {
  if (!startVolumeSlider) return;
  startVolumeSlider.value(round(musicVolume * 100));
}

function setupOutroUI() {
  outroPanel = createDiv();
  outroPanel.addClass('start-panel');
  outroPanel.addClass('outro-panel');
  outroPanel.html(`
    <h1><span class="brand">Congratulations!</span><br>You completed the game!</h1>
    <p class="outro-score">SCORE: 0</p>
    <p class="outro-feedback"></p>
  `);

  let buttonRow = createDiv();
  buttonRow.addClass('outro-buttons');
  buttonRow.parent(outroPanel);

  playAgainButton = createButton('Play again');
  playAgainButton.addClass('start-button');
  playAgainButton.parent(buttonRow);
  playAgainButton.mousePressed(() => {
    playAgainFromOutro();
  });

  menuButton = createButton('Menu');
  menuButton.addClass('start-button');
  menuButton.addClass('secondary-button');
  menuButton.parent(buttonRow);
  menuButton.mousePressed(() => {
    goToMenuFromOutro();
  });

  outroScoreText = outroPanel.elt.querySelector('.outro-score');
  outroFeedbackText = outroPanel.elt.querySelector('.outro-feedback');
  hideOutroPanel();
}

function showOutroPanel() {
  if (!outroPanel) return;

  if (outroScoreText) {
    outroScoreText.textContent = 'SCORE: ' + interactionPoints;
  }

  if (outroFeedbackText) {
    if (interactionPoints > 2) {
      outroFeedbackText.innerHTML = `
        <span class="feedback-lines">
          <span>The least amount of points possible is 2</span>
          <span>E. Schrödinger encourages you to do better!</span>
        </span>
      `;
    } else {
      outroFeedbackText.innerHTML = `
        <span class="feedback-lines">
          <span>You have completed the game with the least amount of points possible!</span>
          <span>E. Schrödinger would be proud.</span>
        </span>
      `;
    }
  }

  outroPanel.show();
}

function hideOutroPanel() {
  if (!outroPanel) return;
  outroPanel.hide();
}

/**
 * Called when the window is resized to keep the UI centered. 
 * The CSS centering rules do most of the work, but p5 elements
 * sometimes need a manual reposition if their size changes.
 */
function windowResizedUI() {
  // Hvis nødvendigt kan vi justere størrelsen her; lige nu håndterer CSS centreringen.
}
