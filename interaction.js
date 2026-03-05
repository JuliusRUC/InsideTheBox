function updatePlayer() {
  // forhinder bevægelse når infoboksen er synlig
  if (infoVisible) return;
  
  // bevægelse er altid tilladt (introRead-logik fjernet)
  if (keyIsDown(LEFT_ARROW)) {
    player.x -= player.speed;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player.x += player.speed;
  }
  if (keyIsDown(UP_ARROW)) {
    player.y -= player.speed;
  }
  if (keyIsDown(DOWN_ARROW)) {
    player.y += player.speed;
  }
  // hold generelt spilleren inden for canvas-grænserne
  player.x = constrain(player.x, player.radius, width - player.radius);

  if (currentScene !== 2) {
    let topLimit = wallThickness + player.radius;
    let bottomLimit = height - wallThickness - player.radius;
    player.y = constrain(player.y, topLimit, bottomLimit);
    return;
  }

  let corridor = getBottomCorridorBounds();
  let corridorLeft = corridor.x + player.radius;
  let corridorRight = corridor.x + corridor.w - player.radius;

  // lodrette begrænsninger: tillad kun adgang til korridoren gennem åbningen i bunden
  let topLimit = wallThickness + player.radius;
  let roomBottomLimit = height - wallThickness - player.radius;
  let insideCorridorDepth = player.y > roomBottomLimit;

  // når spilleren er inde i korridorens dybde, holdes den mellem sidevæggene
  if (insideCorridorDepth) {
    player.x = constrain(player.x, corridorLeft, corridorRight);
  }

  let canEnterCorridor = (player.x >= corridorLeft && player.x <= corridorRight) || insideCorridorDepth;
  let bottomLimit = canEnterCorridor ? height - player.radius : roomBottomLimit;
  player.y = constrain(player.y, topLimit, bottomLimit);
}

function handleInteractionDisplay() {
  // forhinder interaktioner når infoboksen er synlig
  if (infoVisible) return;

  let nonInteractMessages = [];
  let boxDistance = dist(player.x, player.y, boxObj.x, boxObj.y);
  let isNearBox = boxDistance < player.radius + boxObj.size / 2 + 8;

  if (!isNearBox) {
    // nærhedstekst ved forskeren (level 2)
    if (currentScene === 2) {
      let scientistPos = getScene2ScientistPosition();
      let scientistX = scientistPos.x;
      let scientistY = scientistPos.y;
      let scientistTriggerDistance = player.radius + boxObj.size * 0.42;

      if (dist(player.x, player.y, scientistX, scientistY) < scientistTriggerDistance) {
        nonInteractMessages.push("You can't interact with Prof. E. Schrödinger.");
      }
    }

    // nærhedstekst ved hammeren
    if (hammerVisible) {
      let handleLen = vialObj.h * 1.28;
      let handleW = max(8, vialObj.w * 0.27);
      let spacing = vialObj.w * 1.38;
      let hammerX = vialObj.x + vialObj.w / 2 + spacing + handleW / 2;
      let hammerY = vialObj.y;
      let hammerTriggerDistance = player.radius + handleLen * 0.45 + 8;

      if (dist(player.x, player.y, hammerX, hammerY) < hammerTriggerDistance) {
        nonInteractMessages.push('You cant interact with the hammer');
      }
    }

    // nærhedstekst ved giftglasset
    if (!vialBroken) {
      let vialTriggerDistance = player.radius + max(vialObj.w, vialObj.h) / 2 + 8;
      if (dist(player.x, player.y, vialObj.x, vialObj.y) < vialTriggerDistance) {
        nonInteractMessages.push('you cant interact with the poison vial');
      }
    }
  }

  if (nonInteractMessages.length > 0) {
    push();
    textSize(14);
    textAlign(CENTER);
    textStyle(BOLD);
    fill(0);
    noStroke();
    for (let i = 0; i < nonInteractMessages.length; i++) {
      text(nonInteractMessages[i], player.x, player.y - player.radius - 10 - i * 18);
    }
    pop();
  }
  
  // hvis spilleren er tæt på kassen
  if (isNearBox) {
    push();
    textSize(14);
    textAlign(CENTER);
    textStyle(BOLD);
    fill(0);
    noStroke();
    text('Press SPACE to observe the inside of the box', player.x, player.y - player.radius - 10);
    pop();
    
    // hvis spilleren har kigget ind og stadig er tæt på kassen, vis besked
    let showScene1Message = currentScene === 1 && isLookingInBox;
    let showScene2Message = currentScene === 2 && scene2LookedInBox;
    if (showScene1Message || showScene2Message) {
      push();
      rectMode(CENTER);
      fill(255, 255, 204, 220);
      stroke(0);
      strokeWeight(2);
      rect(width / 2, height / 2 - 100, 300, 80, 8);
      noStroke();
      fill(0);
      textSize(16);
      textAlign(CENTER, CENTER);
      let statusText = currentScene === 2
        ? 'The cat is ' + scene2CatStatus
        : 'The mouse is ' + mouseStatus + '.';
      text(statusText, width / 2, height / 2 - 100);
      rectMode(CORNER);
      pop();
    }
  } else {
    // hvis spilleren går væk fra kassen, nulstil flaget for den aktuelle scene
    if (currentScene === 2) {
      scene2LookedInBox = false;
    } else {
      isLookingInBox = false;
    }
  }

  // interaktions-tekster ved konsoller
  for (let c of consoles) {
    let dc = dist(player.x, player.y, c.x, c.y);
    if (dc < player.radius + Math.max(c.w, c.h) / 2 + 8) {
      push();
      textSize(14);
      textAlign(CENTER);
      textStyle(BOLD);
      fill(0);
      noStroke();
      text('Press SPACE to submit this answer', player.x, player.y - player.radius - 10);
      pop();
    }
  }
}

function keyPressed() {

  if (gameState === 'attributions' && keyCode === ESCAPE) {
    returnToMenuFromAttributions();
    return;
  }

  // registrér tast til debug-visning på skærmen
  pressedKeys.push(key);
  if (pressedKeys.length > 5) pressedKeys.shift();

  // tillad altid at skifte info-overlay med ESCAPE-tasten
  if (keyCode === ESCAPE) {
    infoVisible = !infoVisible;
    console.log('infoVisible toggled', infoVisible, 'key', key, 'keyCode', keyCode);
    return;
  }

  if (gameState === 'playing') {
    if (key === ' ') {
      // forhinder interaktioner når infoboksen er synlig
      if (infoVisible) return;

      if (currentScene === 2) {
        let dScene2 = dist(player.x, player.y, boxObj.x, boxObj.y);
        if (dScene2 < player.radius + boxObj.size / 2 + 8) {
          scene2LookedInBox = true;
          interactionPoints += 1;
        }

        for (let c of consoles) {
          let dcScene2 = dist(player.x, player.y, c.x, c.y);
          if (dcScene2 < player.radius + Math.max(c.w, c.h) / 2 + 8) {
            interactionPoints += 1;
            handleConsoleAnswer(c);
          }
        }
        return;
      }

      if (currentScene !== 1) return;
      if (pendingScene2At !== 0) return;
      if (hammerSmashActive) return;
      
      // interaktioner udløses med mellemrumstasten
      let d = dist(player.x, player.y, boxObj.x, boxObj.y);
      if (d < player.radius + boxObj.size / 2 + 8) {
        isLookingInBox = true;
        hasCheckedBox = true;
        interactionPoints += 1;
      }
      // tjek konsoller og indsend svar for hver konsol inden for rækkevidde
      for (let c of consoles) {
        let dc = dist(player.x, player.y, c.x, c.y);
        if (dc < player.radius + Math.max(c.w, c.h) / 2 + 8) {
          interactionPoints += 1;
          handleConsoleAnswer(c);
        }
      }
    }
  }
}

function handleConsoleAnswer(consoleObj) {
  if (currentScene === 2) {
    let scene2CorrectLabel = scene2CatStatus === 'dead' ? 'Dead' : 'Alive';

    if (consoleObj.label === scene2CorrectLabel) {
      wrongConsoleObj = null;
      correctConsoleObj = null;
      scene2LookedInBox = false;
      currentScene = 3;
      infoVisible = false;
      restartMenuOutroMusicOnNextPlay = true;
      showOutroPanel();
      return;
    }

    correctConsoleObj = null;
    setWrongObservationNoteForAnswer(consoleObj);
    wrongConsoleObj = consoleObj;
    return;
  }

  let correctLabel;

  if (!hasCheckedBox) {
    correctLabel = 'Both/neither';
  } else if (mouseStatus === 'alive') {
    correctLabel = 'Alive';
  } else {
    correctLabel = 'Dead';
  }

  if (consoleObj.label === correctLabel) {
    wrongConsoleObj = null;
    correctConsoleObj = consoleObj;
    setCorrectObservationNoteForAnswer(consoleObj);

    if (!hasCheckedBox && consoleObj.label === 'Both/neither') {
      scene2CatStatus = 'alive';
      startHammerDropAwaySequence();
      return;
    }

    if (hasCheckedBox) {
      scene2CatStatus = 'dead';
      startHammerSmashSequence();
      return;
    }

    scene2CatStatus = 'alive';
    currentScene = 2;
    scene2LookedInBox = false;
    infoVisible = true;
    startScene2WakeSequence();
    return;
  }

  correctConsoleObj = null;
  setWrongObservationNoteForAnswer(consoleObj);
  wrongConsoleObj = consoleObj;
}

function setCorrectObservationNoteForAnswer(consoleObj) {
  correctAnswerObservationNote = 'Your choice matches the expected outcome.';

  if (currentScene === 1 && !hasCheckedBox && consoleObj.label === 'Both/neither') {
    correctAnswerObservationNote =
      'The outcome depends on whether the atom decays.\n' +
      'Before the box is observed, the mouse has no definite state.\n' +
      'In this thought experiment the mouse is therefore both and neither dead nor alive.';
  }
}

function setWrongObservationNoteForAnswer(consoleObj) {
  wrongAnswerObservationNote = '[Reason of incorrect]';

  if (currentScene === 1 && !hasCheckedBox && consoleObj.label === 'Either or') {
    wrongAnswerObservationNote = 'A 50% chance does not mean the outcome is already decided.';
    return;
  }

  if (currentScene === 1 && !hasCheckedBox && (consoleObj.label === 'Alive' || consoleObj.label === 'Dead')) {
    let selectedState = consoleObj.label.toLowerCase();
    wrongAnswerObservationNote = 'How do you know that the mouse is ' + selectedState + ' without looking inside the box?';
  }
}

function mousePressed() {
  if (gameState === 'start' && !musicStartedByUser) {
    startMusicFromUserGesture();
  }

  if (tryStartSoundSliderDrag(mouseX, mouseY)) {
    return false;
  }
}

function mouseDragged() {
  if (!musicSliderDragging) return;
  updateMusicVolumeFromMouse(mouseX);
  return false;
}

function mouseReleased() {
  musicSliderDragging = false;
}
