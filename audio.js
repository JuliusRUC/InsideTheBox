let musicAttributionLabel;
let menuOutroMusic = null;

function setupAudioSystem() {
  initBackgroundMusic();
  initMenuOutroMusic();
  setupMusicAttributionLabel();
  syncMusicStateForCurrentScene();
}

function initBackgroundMusic() {
  if (!GAMEPLAY_MUSIC_FILE_PATH) {
    backgroundMusic = null;
    return;
  }

  backgroundMusic = new Audio(GAMEPLAY_MUSIC_FILE_PATH);
  backgroundMusic.loop = true;
  backgroundMusic.volume = musicVolume;
  backgroundMusic.preload = 'auto';

  backgroundMusic.addEventListener('error', () => {
    console.warn('Background music file could not be loaded at:', GAMEPLAY_MUSIC_FILE_PATH);
  });

  setMusicVolume(musicVolume);
}

function initMenuOutroMusic() {
  if (!MENU_OUTRO_MUSIC_FILE_PATH) {
    menuOutroMusic = null;
    return;
  }

  menuOutroMusic = new Audio(MENU_OUTRO_MUSIC_FILE_PATH);
  menuOutroMusic.loop = true;
  menuOutroMusic.volume = musicVolume;
  menuOutroMusic.preload = 'auto';

  menuOutroMusic.addEventListener('error', () => {
    console.warn('Menu/outro music file could not be loaded at:', MENU_OUTRO_MUSIC_FILE_PATH);
  });

  menuOutroMusic.addEventListener('canplaythrough', () => {
    syncMusicStateForCurrentScene();
  });

  menuOutroMusic.load();

  setMusicVolume(musicVolume);
}

function setupMusicAttributionLabel() {
  musicAttributionLabel = createDiv(MUSIC_ATTRIBUTION_TEXT);
  musicAttributionLabel.addClass('music-attribution');
  musicAttributionLabel.hide();
}

function startMusicFromUserGesture() {
  musicStartedByUser = true;
  syncMusicStateForCurrentScene();
}

function stopMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
  if (menuOutroMusic) {
    menuOutroMusic.pause();
    menuOutroMusic.currentTime = 0;
  }
}

function syncMusicStateForCurrentScene() {
  let shouldPlayGameplayMusic = gameState === 'playing' && (currentScene === 1 || currentScene === 2);
  let shouldPlayMenuOutroMusic = gameState === 'start' || gameState === 'attributions' || (gameState === 'playing' && currentScene === 3);

  if (musicAttributionLabel) {
    // attribution is now shown in dedicated scene, not in gameplay HUD
    musicAttributionLabel.hide();
  }

  if (!musicStartedByUser) return;

  if (shouldPlayGameplayMusic) {
    playTrack(backgroundMusic);
    pauseTrack(menuOutroMusic);
    return;
  }

  if (shouldPlayMenuOutroMusic) {
    if (menuOutroMusic && restartMenuOutroMusicOnNextPlay) {
      menuOutroMusic.currentTime = 0;
      restartMenuOutroMusicOnNextPlay = false;
    }
    playTrack(menuOutroMusic);
    pauseTrack(backgroundMusic);
    return;
  }

  pauseTrack(backgroundMusic);
  pauseTrack(menuOutroMusic);
}

function playTrack(track) {
  if (!track) return;
  if (!track.paused) return;

  let now = Date.now();
  if (track._nextAutoPlayRetryAt && now < track._nextAutoPlayRetryAt) {
    return;
  }

  track.play().catch(() => {
    // autoplay/user-gesture policy can block playback until a click gesture
    track._nextAutoPlayRetryAt = Date.now() + 250;
  });

  track._nextAutoPlayRetryAt = 0;
}

function pauseTrack(track) {
  if (!track) return;
  if (!track.paused) {
    track.pause();
  }
}

function setMusicVolume(volumeValue) {
  musicVolume = constrain(volumeValue, 0, 1);
  if (backgroundMusic) {
    backgroundMusic.volume = musicVolume;
  }
  if (menuOutroMusic) {
    menuOutroMusic.volume = musicVolume;
  }
  if (typeof syncStartVolumeSlider === 'function') {
    syncStartVolumeSlider();
  }
}

function getSoundControlLayout() {
  let sliderW = constrain(width * 0.14, 120, 170);
  let sliderRight = width - wallThickness - 14;
  let sliderLeft = sliderRight - sliderW;
  let sliderY = height - wallThickness + 26;

  return {
    sliderLeft,
    sliderRight,
    sliderY,
    iconX: sliderLeft - 20,
    iconY: sliderY
  };
}

function getSoundKnobX(layout = getSoundControlLayout()) {
  return lerp(layout.sliderLeft, layout.sliderRight, musicVolume);
}

function updateMusicVolumeFromMouse(mouseXValue) {
  let layout = getSoundControlLayout();
  let nextVolume = map(mouseXValue, layout.sliderLeft, layout.sliderRight, 0, 1);
  setMusicVolume(nextVolume);
}

function tryStartSoundSliderDrag(mouseXValue, mouseYValue) {
  if (!(gameState === 'playing' && (currentScene === 1 || currentScene === 2))) {
    return false;
  }

  let layout = getSoundControlLayout();
  let knobX = getSoundKnobX(layout);
  let knobY = layout.sliderY;
  let hitRadius = 12;

  let onKnob = dist(mouseXValue, mouseYValue, knobX, knobY) <= hitRadius;
  let onTrack =
    mouseXValue >= layout.sliderLeft - 4 &&
    mouseXValue <= layout.sliderRight + 4 &&
    abs(mouseYValue - layout.sliderY) <= 8;

  if (onKnob || onTrack) {
    musicSliderDragging = true;
    updateMusicVolumeFromMouse(mouseXValue);
    return true;
  }

  return false;
}
