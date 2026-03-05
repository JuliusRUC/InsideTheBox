// Musik sat ind af agent. Al musik er royalty-free og brugt i overensstemmelse med licenserne. Se attributionssiden for detaljer.

let musicAttributionLabel;
let menuOutroMusic = null;

function setupAudioSystem() {
  initBackgroundMusic();
  initMenuOutroMusic();
  initGlassBreakSfx();
  initThudImpactSfx();
  setupMusicAttributionLabel();
  syncMusicStateForCurrentScene();
}

function initThudImpactSfx() {
  if (!THUD_IMPACT_SFX_FILE_PATH) {
    thudImpactSfx = null;
    return;
  }

  thudImpactSfx = new Audio(THUD_IMPACT_SFX_FILE_PATH);
  thudImpactSfx.preload = 'auto';
  thudImpactSfx.volume = min(1, musicVolume * 1.1);
  thudImpactSfx.load();

  thudImpactSfx.addEventListener('error', () => {
    console.warn('Thud impact SFX file could not be loaded at:', THUD_IMPACT_SFX_FILE_PATH);
  });
}

function initGlassBreakSfx() {
  if (!GLASS_BREAK_SFX_FILE_PATH) {
    glassBreakSfx = null;
    return;
  }

  glassBreakSfx = new Audio(GLASS_BREAK_SFX_FILE_PATH);
  glassBreakSfx.preload = 'auto';
  glassBreakSfx.volume = min(1, musicVolume * 1.15);
  glassBreakSfx.load();

  glassBreakSfx.addEventListener('error', () => {
    console.warn('Glass break SFX file could not be loaded at:', GLASS_BREAK_SFX_FILE_PATH);
  });
}

function primeGlassBreakSfxFromUserGesture() {
  if (!glassBreakSfx) return;
  if (glassBreakSfx._primedByUserGesture) return;

  let originalVolume = glassBreakSfx.volume;
  glassBreakSfx.volume = 0;
  glassBreakSfx.currentTime = 0;

  glassBreakSfx.play().then(() => {
    glassBreakSfx.pause();
    glassBreakSfx.currentTime = 0;
    glassBreakSfx.volume = originalVolume;
    glassBreakSfx._primedByUserGesture = true;
  }).catch(() => {
    glassBreakSfx.volume = originalVolume;
  });
}

function primeThudImpactSfxFromUserGesture() {
  if (!thudImpactSfx) return;
  if (thudImpactSfx._primedByUserGesture) return;

  let originalVolume = thudImpactSfx.volume;
  thudImpactSfx.volume = 0;
  thudImpactSfx.currentTime = 0;

  thudImpactSfx.play().then(() => {
    thudImpactSfx.pause();
    thudImpactSfx.currentTime = 0;
    thudImpactSfx.volume = originalVolume;
    thudImpactSfx._primedByUserGesture = true;
  }).catch(() => {
    thudImpactSfx.volume = originalVolume;
  });
}

function playGlassBreakSfx() {
  if (!glassBreakSfx) return;

  let playNow = () => {
    glassBreakSfx.currentTime = 0;
    glassBreakSfx.play().catch((err) => {
      console.warn('Glass break SFX could not be played:', err);
    });
  };

  if (glassBreakSfx.readyState >= 2) {
    playNow();
    return;
  }

  let onReady = () => {
    glassBreakSfx.removeEventListener('canplaythrough', onReady);
    playNow();
  };

  glassBreakSfx.addEventListener('canplaythrough', onReady);
  glassBreakSfx.load();
}

function playThudImpactSfx() {
  if (!thudImpactSfx) return;

  let playNow = () => {
    thudImpactSfx.currentTime = 0;
    thudImpactSfx.play().catch((err) => {
      console.warn('Thud impact SFX could not be played:', err);
    });
  };

  if (thudImpactSfx.readyState >= 2) {
    playNow();
    return;
  }

  let onReady = () => {
    thudImpactSfx.removeEventListener('canplaythrough', onReady);
    playNow();
  };

  thudImpactSfx.addEventListener('canplaythrough', onReady);
  thudImpactSfx.load();
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
  primeGlassBreakSfxFromUserGesture();
  primeThudImpactSfxFromUserGesture();
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
    // Credits til kunstnere er givet i et dedikeret attributionsafsnit, så vi behøver ikke vise det på skærmen under gameplay eller menu-outro.
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
  if (glassBreakSfx) {
    glassBreakSfx.volume = min(1, musicVolume * 1.15);
  }
  if (thudImpactSfx) {
    thudImpactSfx.volume = min(1, musicVolume * 1.1);
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
