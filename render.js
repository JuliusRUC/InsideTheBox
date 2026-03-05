function drawInteractionPoints() {
  push();
  textAlign(CENTER, TOP);
  textSize(52);
  textStyle(BOLD);
  fill('#ff8c42');
  stroke(0);
  strokeWeight(4);
  text(`Points: ${interactionPoints}`, width / 2, wallThickness * 0.18);
  pop();
}

function drawBottomRightHud() {
  push();
  fill(0);
  textSize(12);
  textAlign(RIGHT, BOTTOM);
  text('Use ESC to toggle the information box on/off', width - wallThickness - 10, height - wallThickness - 10);
  pop();

  if (!(gameState === 'playing' && (currentScene === 1 || currentScene === 2))) return;

  let layout = getSoundControlLayout();
  let knobX = getSoundKnobX(layout);

  push();
  stroke(230);
  strokeWeight(3);
  line(layout.sliderLeft, layout.sliderY, layout.sliderRight, layout.sliderY);

  noStroke();
  fill('#ff8c42');
  circle(knobX, layout.sliderY, musicSliderDragging ? 16 : 14);

  // lydikon (orange) fra PNG-asset
  if (soundIconImage) {
    imageMode(CENTER);
    image(soundIconImage, layout.iconX - 2, layout.iconY + 0.5, 23, 23);
  } else {
    // fallback mens ikonet indlæses
    noStroke();
    fill('#ff8c42');
    rectMode(CENTER);
    rect(layout.iconX - 7, layout.iconY, 5, 8, 1.5);
    triangle(layout.iconX - 4, layout.iconY - 5, layout.iconX + 2, layout.iconY - 2, layout.iconX + 2, layout.iconY + 2);
    triangle(layout.iconX - 4, layout.iconY + 5, layout.iconX + 2, layout.iconY + 2, layout.iconX + 2, layout.iconY - 2);
    noFill();
    stroke('#ff8c42');
    strokeWeight(2.2);
    arc(layout.iconX + 6, layout.iconY, 9, 10, -PI / 3, PI / 3);
    arc(layout.iconX + 10, layout.iconY, 14, 15, -PI / 3, PI / 3);
  }
  pop();
}

function initSoundIconAsset() {
  if (!SOUND_ICON_FILE_PATH) return;

  loadImage(
    SOUND_ICON_FILE_PATH,
    (img) => {
      img.loadPixels();
      let processed = createImage(img.width, img.height);
      processed.loadPixels();

      for (let i = 0; i < img.pixels.length; i += 4) {
        let srcR = img.pixels[i];
        let srcG = img.pixels[i + 1];
        let srcB = img.pixels[i + 2];
        let srcA = img.pixels[i + 3];

        let luminance = (srcR + srcG + srcB) / 3;
        let darkness = 1 - luminance / 255;
        let maskedAlpha = round(srcA * max(0, darkness));

        processed.pixels[i] = 255;
        processed.pixels[i + 1] = 140;
        processed.pixels[i + 2] = 66;
        processed.pixels[i + 3] = maskedAlpha;
      }

      processed.updatePixels();
      soundIconImage = processed;
    },
    () => {
      soundIconImage = null;
      console.warn('Sound icon could not be loaded at:', SOUND_ICON_FILE_PATH);
    }
  );
}

function drawAttributionsScene() {
  let panelW = constrain(width * 0.8, 540, 1020);
  let panelH = constrain(height * 0.78, 360, 760);
  let panelX = width / 2 - panelW / 2;
  let panelY = height / 2 - panelH / 2;

  push();
  noStroke();
  fill(0, 165);
  rect(panelX, panelY, panelW, panelH, 12);

  fill('#ff8c42');
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(constrain(panelH * 0.08, 24, 42));
  text('ATTRIBUTIONS', panelX + panelW / 2, panelY + 18);

  fill(255);
  textStyle(NORMAL);
  textSize(constrain(panelH * 0.038, 12, 17));
  text('Press ESC to return to the menu', panelX + panelW / 2, panelY + panelH - 32);

  let gap = 16;
  let boxW = panelW - 44;
  let boxH = (panelH - 120 - gap) / 2;
  let boxX = panelX + 22;
  let box1Y = panelY + 64;
  let box2Y = box1Y + boxH + gap;

  drawAttributionBox(
    boxX,
    box1Y,
    boxW,
    boxH,
    'bensound-enigmatic.mp3',
    'Artist: Benjamin Tissot',
    'License: ND1RUAAXDVWT4555',
    'Source: https://www.bensound.com/free-music-for-videos'
  );

  drawAttributionBox(
    boxX,
    box2Y,
    boxW,
    boxH,
    'bensound_sleepless.mp3',
    'Artist: Diffie Bosman',
    'License: TT5GZWM1WTTH3EQE',
    'Source: https://www.bensound.com/free-music-for-videos'
  );
  pop();
}

function drawAttributionBox(x, y, w, h, title, artistLine, licenseLine, sourceLine) {
  fill(0, 215);
  stroke('#ff8c42');
  strokeWeight(2);
  rect(x, y, w, h, 10);

  noStroke();
  fill('#ff8c42');
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(constrain(h * 0.16, 13, 20));
  text(title, x + 14, y + 10);

  fill(255);
  textStyle(NORMAL);
  textSize(constrain(h * 0.13, 12, 17));
  let contentY = y + 38;
  let contentW = w - 28;
  text(artistLine + '\n' + licenseLine + '\n' + sourceLine, x + 14, contentY, contentW, h - (contentY - y) - 12);
}

function drawWrongPopup() {
  if (!wrongConsoleObj) return;

  let triggerDistance = player.radius + Math.max(wrongConsoleObj.w, wrongConsoleObj.h) / 2 + 8;
  let currentDistance = dist(player.x, player.y, wrongConsoleObj.x, wrongConsoleObj.y);
  if (currentDistance > triggerDistance) {
    wrongConsoleObj = null;
    return;
  }

  drawAnswerPopup('Your answer is incorrect', color(170, 22, 22), wrongAnswerObservationNote);
}

function drawCorrectPopup() {
  if (!correctConsoleObj) return;

  let triggerDistance = player.radius + Math.max(correctConsoleObj.w, correctConsoleObj.h) / 2 + 8;
  let currentDistance = dist(player.x, player.y, correctConsoleObj.x, correctConsoleObj.y);
  if (currentDistance > triggerDistance) {
    correctConsoleObj = null;
    return;
  }

  drawAnswerPopup('Your answer is correct', color(20, 170, 20), correctAnswerObservationNote);
}

function drawAnswerPopup(headerText, headerColor, observationText) {
  push();
  resetMatrix();
  rectMode(CENTER);
  textFont('Poppins');

  let popupW = min(470, width - 70);
  let popupH = 220;
  let popupX = width / 2;
  let popupY = height / 2 - 40;
  let popupLeft = popupX - popupW / 2;
  let popupTop = popupY - popupH / 2;

  fill(255, 255, 204, 240);
  stroke(0);
  strokeWeight(2);
  rect(popupX, popupY, popupW, popupH, 12);

  // Text rectangles use rectMode; switch back so text(x, y, w, h) uses top-left anchor.
  rectMode(CORNER);

  noStroke();
  fill(headerColor);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(23);
  text(headerText, popupX, popupTop + 16);

  let textPadding = 18;
  let noteX = popupLeft + textPadding;
  let noteLabelY = popupTop + 64;
  let bodyY = noteLabelY + 28;
  let bodyW = popupW - textPadding * 2;
  let bodyH = popupH - (bodyY - popupTop) - 14;

  fill(48);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(16);
  text('Observation note', noteX, noteLabelY);

  textStyle(NORMAL);
  let bodySize = fitBodyTextSize(observationText, bodyW, bodyH, 14, 10);
  textSize(bodySize);
  textLeading(bodySize * 1.28);
  textWrap(WORD);
  text(observationText, noteX, bodyY, bodyW, bodyH);

  pop();
}

function drawScene2Placeholder() {
  drawFloorLevel2();
  drawWalls();
  drawScene2Scientist();

  drawBox();
  for (let c of consoles) {
    drawConsole(c);
  }
}

function drawOutroScenePlaceholder() {
  push();
  noStroke();
  fill(0, 170);
  rect(0, 0, width, height);
  pop();
}

function getScene2ScientistPosition() {
  return {
    x: boxObj.x - boxObj.size * 1.45,
    y: boxObj.y + boxObj.size * 0.18
  };
}

function drawScene2Scientist() {
  let scientistPos = getScene2ScientistPosition();
  let scientistX = scientistPos.x;
  let scientistY = scientistPos.y;

  push();
  translate(scientistX, scientistY);

  // ben
  stroke(25);
  strokeWeight(5);
  line(-9, 28, -12, 64);
  line(9, 28, 12, 64);

  // sko
  noStroke();
  fill(30);
  ellipse(-12, 66, 16, 7);
  ellipse(12, 66, 16, 7);

  // kittel-krop
  rectMode(CENTER);
  fill(250);
  stroke(40);
  strokeWeight(2);
  rect(0, 8, 42, 52, 8);

  // kittel-split
  stroke(180);
  strokeWeight(1.5);
  line(0, -12, 0, 31);

  // skjorte + slips
  noStroke();
  fill(60, 150, 235);
  rect(0, -1, 16, 18, 3);
  fill(185, 20, 20);
  triangle(0, -8, -4, 5, 4, 5);
  triangle(0, 5, -3, 14, 3, 14);

  // arme
  stroke(250);
  strokeWeight(8);
  line(-18, -3, -30, 18);
  line(18, -3, 30, 18);

  // hænder
  noStroke();
  fill(245, 210, 175);
  circle(-30, 18, 10);
  circle(30, 18, 10);

  // hals
  rectMode(CENTER);
  fill(245, 210, 175);
  rect(0, -25, 10, 10, 2);

  // hoved
  fill(245, 210, 175);
  stroke(35);
  strokeWeight(2);
  circle(0, -40, 34);

  // hår
  noStroke();
  fill(45);
  arc(0, -45, 34, 24, PI, TWO_PI, CHORD);

  // briller
  noFill();
  stroke(35);
  strokeWeight(2);
  circle(-7, -40, 9);
  circle(7, -40, 9);
  line(-2.5, -40, 2.5, -40);

  // øjne
  noStroke();
  fill(35);
  circle(-7, -40, 2.5);
  circle(7, -40, 2.5);

  // smil
  noFill();
  stroke(35);
  strokeWeight(1.5);
  arc(0, -33, 10, 6, 0, PI);

  rectMode(CORNER);
  pop();
}

function drawFloorLevel1() {
  // brun baggrund som papkasse
  noStroke();
  fill(180, 140, 80); // brun farve der ligner pap
  rect(0, 0, width, height);
  
  // deterministisk teksturgitter for papfornemmelse (ingen flimren)
  fill(170, 130, 70);
  let spacing = 60;
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      // forskyd hver anden række for et forskudt mønster
      let offsetX = (Math.floor(y / spacing) % 2) * 30;
      rect(x + offsetX, y, 40, 12, 2);
    }
  }
  noStroke();
}

function drawFloorLevel2() {
  // grundfarve hvid
  noStroke();
  fill(240);
  rect(0, 0, width, height);

  // gitterlinjer til fliser (sort)
  stroke(0);
  strokeWeight(1);
  let sz = 50;
  for (let x = 0; x < width; x += sz) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += sz) {
    line(0, y, width, y);
  }
  noStroke();
}

function drawPlayer() {
  if (currentScene === 2) {
    drawHumanPlayer();
    return;
  }

  drawCatPlayer();
}

function drawCatPlayer() {
  // simpel tegneserie-kat: hoved + krop + hale
  push();
  translate(player.x, player.y);

  // krop
  noStroke();
  fill(0); // sort
  ellipse(0, player.radius * 0.5, player.radius * 1.5, player.radius * 1.2);

  // hoved
  circle(0, -player.radius * 0.3, player.radius * 1.1);

  // ører
  triangle(-player.radius * 0.4, -player.radius * 0.9, -player.radius * 0.2, -player.radius * 1.4, -player.radius * 0.1, -player.radius * 0.6);
  triangle(player.radius * 0.4, -player.radius * 0.9, player.radius * 0.2, -player.radius * 1.4, player.radius * 0.1, -player.radius * 0.6);

  // øjne
  fill("white");
  circle(-player.radius * 0.2, -player.radius * 0.3, player.radius * 0.15);
  circle(player.radius * 0.2, -player.radius * 0.3, player.radius * 0.15);

  // hale
  stroke("black");
  strokeWeight(4);
  noFill();
  beginShape();
  vertex(player.radius * 0.7, player.radius * 0.3);
  bezierVertex(player.radius * 1.2, player.radius * 0.1, player.radius * 1.1, player.radius * 0.8, player.radius * 0.5, player.radius * 0.9);
  endShape();

  pop();
}

function drawHumanPlayer() {
  // simpelt tegneserie-menneske i samme minimalistiske stil som katten
  push();
  translate(player.x, player.y);

  // krop (skjorte)
  noStroke();
  fill(0);
  rectMode(CENTER);
  rect(0, player.radius * 0.45, player.radius * 1.1, player.radius * 1.45, 8);

  // hoved
  fill(245, 210, 175);
  circle(0, -player.radius * 0.55, player.radius * 0.95);

  // hår
  fill(30);
  arc(0, -player.radius * 0.66, player.radius * 0.95, player.radius * 0.72, PI, TWO_PI, CHORD);

  // øjne
  fill(255);
  circle(-player.radius * 0.14, -player.radius * 0.58, player.radius * 0.12);
  circle(player.radius * 0.14, -player.radius * 0.58, player.radius * 0.12);

  // arme
  stroke(0);
  strokeWeight(4);
  line(-player.radius * 0.52, player.radius * 0.22, -player.radius * 0.88, player.radius * 0.72);
  line(player.radius * 0.52, player.radius * 0.22, player.radius * 0.88, player.radius * 0.72);

  // ben
  line(-player.radius * 0.22, player.radius * 1.05, -player.radius * 0.22, player.radius * 1.55);
  line(player.radius * 0.22, player.radius * 1.05, player.radius * 0.22, player.radius * 1.55);

  rectMode(CORNER);
  pop();
}


// overlay vist før spillet starter; semitransparent sort boks
function drawIntroOverlay() {
  if (!infoVisible) return; // intet at tegne når overlay er lukket

  let overlayHeader = currentScene === 2 ? LEVEL2_HEADER : INTRO_HEADER;
  let overlayBody = currentScene === 2 ? LEVEL2_BODY : INTRO_BODY;

  let roomInnerWidth = width - wallThickness * 2;
  let roomInnerHeight = height - wallThickness * 2;
  let w = constrain(width * 0.7, 320, roomInnerWidth - 20);
  let h = constrain(roomInnerHeight * 0.5, 185, 360);
  let x = width / 2 - w / 2;
  // vi vil have overlayet over kassen og konsollerne
  let aboveBox = boxObj.y - boxObj.size / 2 - h - 20;
  let highestConsole = height; // start nederst
  for (let c of consoles) {
    highestConsole = min(highestConsole, c.y - c.h / 2 - h - 20);
  }
  let y = min(aboveBox, highestConsole);
  // undgå at ramme topvæg / bundvæg
  y = max(y, wallThickness + 12);
  y = min(y, height - wallThickness - h - 12);

  push();
  fill(0);
  noStroke();
  rect(x, y, w, h, 8);

  fill('#ff8c42'); // orange som startskærmen
  textFont('Poppins');

  let headerSize = constrain(h * 0.09, 16, 22);
  let contextSize = constrain(h * 0.08, 14, 19);
  let bodyStartSize = constrain(h * 0.067, 12, 17);

  // overskrift
  textSize(headerSize);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text(overlayHeader, x + w / 2, y + 12);

  // brødtekst – tegn første linje (context) separat så den kan være større/orange
  let lines = overlayBody.split('\n');
  let firstLine = lines.shift();
  let rest = lines.join('\n');

  // context-titel
  fill('#ff8c42');
  textSize(contextSize);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  let contextY = y + 12 + headerSize + 8;
  text(firstLine, x + 12, contextY);

  // resterende brødtekst
  fill(255);
  let bodyY = contextY + contextSize + 8;
  let bodyW = w - 24;
  let bodyH = h - (bodyY - y) - 12;
  let bodySize = fitBodyTextSize(rest, bodyW, bodyH, bodyStartSize, 11);
  textSize(bodySize);
  textLeading(bodySize * 1.28);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  text(rest, x + 12, bodyY, bodyW, bodyH);

  // ESC-indikator i øverste højre hjørne
  let escBoxW = constrain(w * 0.09, 42, 56);
  let escBoxH = constrain(h * 0.125, 24, 34);
  let escBoxX = x + w - escBoxW - 10;
  let escBoxY = y + 10;
  
  // baggrund til ESC-boks
  stroke(255);
  strokeWeight(2);
  fill(0);
  rect(escBoxX, escBoxY, escBoxW, escBoxH, 4);
  
  // ESC-tekst
  noStroke();
  fill(255);
  textSize(constrain(escBoxH * 0.45, 11, 14));
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text('ESC', escBoxX + escBoxW / 2, escBoxY + escBoxH / 2);

  // footer fjernet – instruktioner toggles med ESCAPE-tasten

  pop();
}

function fitBodyTextSize(textValue, maxW, maxH, startSize, minSize) {
  let resolvedSize = startSize;

  for (let candidate = floor(startSize); candidate >= minSize; candidate--) {
    textSize(candidate);
    let leading = candidate * 1.28;
    textLeading(leading);
    let lineCount = countWrappedLines(textValue, maxW);
    if (lineCount * leading <= maxH) {
      resolvedSize = candidate;
      break;
    }
  }

  return resolvedSize;
}

function countWrappedLines(textValue, maxW) {
  let paragraphs = textValue.split('\n');
  let total = 0;

  for (let paragraph of paragraphs) {
    let clean = paragraph.trim();
    if (clean.length === 0) {
      total += 1;
      continue;
    }

    let words = clean.split(/\s+/);
    let currentLine = '';

    for (let word of words) {
      let candidate = currentLine.length > 0 ? currentLine + ' ' + word : word;
      if (textWidth(candidate) > maxW && currentLine.length > 0) {
        total += 1;
        currentLine = word;
      } else {
        currentLine = candidate;
      }
    }

    if (currentLine.length > 0) {
      total += 1;
    }
  }

  return max(1, total);
}

function drawRoom() {
  drawFloorLevel1();
  drawWalls();
  drawBox();
  drawVial();
  if (hammerVisible) {
    drawHammer();
  }
  for (let c of consoles) {
    drawConsole(c);
  }
  // ingen vægtekst
}

function drawScene2WakeOverlay() {
  if (!scene2WakeActive) return;

  let elapsed = millis() - scene2WakeStartedAt;
  let fadeStart = SCENE2_WAKE_HOLD_DURATION;
  let fadeEnd = SCENE2_WAKE_HOLD_DURATION + SCENE2_WAKE_FADE_DURATION;

  let overlayAlpha = 255;
  if (elapsed > fadeStart) {
    overlayAlpha = map(elapsed, fadeStart, fadeEnd, 255, 0);
  }
  overlayAlpha = constrain(overlayAlpha, 0, 255);

  push();
  noStroke();
  fill(0, overlayAlpha);
  rect(0, 0, width, height);

  // stjerner oven på mørkt overlay (samme visuelle stil som ved spilstart)
  for (let s of stars) {
    fill(255, overlayAlpha);
    circle(s.x, s.y, s.size);
  }

  // stor centreret orange tekst med sort kontur
  stroke(0, overlayAlpha);
  strokeWeight(5);
  fill(255, 140, 66, overlayAlpha);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(52);

  // manuel linjebrydning for at holde teksten helt centreret på canvas
  let maxLineWidth = width * 0.8;
  let words = SCENE2_WAKE_TEXT.split(' ');
  let lines = [];
  let currentLine = '';

  for (let word of words) {
    let candidate = currentLine.length > 0 ? currentLine + ' ' + word : word;
    if (textWidth(candidate) > maxLineWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  let lineHeight = 62;
  let startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], width / 2, startY + i * lineHeight);
  }
  pop();
}

function drawHammer() {
  // tegn en lodret hammer til højre for hætteglasset, skaleret efter hætteglassets størrelse
  // beregn størrelser relativt til hætteglasset så proportionerne bevares
  let handleLen = vialObj.h * 1.28;
  let handleW = max(8, vialObj.w * 0.27);
  // gør hovedet mindre så det ikke dominerer skaftet
  let headW = vialObj.w * 1.28;
  let headH = vialObj.w * 0.56;
  // øg afstanden så hovedet ikke overlapper hætteglasset
  let spacing = vialObj.w * 1.38;

  // centerposition for hammer (til højre for hætteglasset)
  let hx = vialObj.x + vialObj.w / 2 + spacing + handleW / 2;
  let hy = vialObj.y;
  let hammerAngle = 0;

  if (hammerSmashActive) {
    let t = constrain((millis() - hammerSmashStartedAt) / HAMMER_SMASH_DURATION, 0, 1);

    if (hammerAnimationMode === 'smash') {
      let impactX = vialObj.x;
      let impactY = vialObj.y - vialObj.h * 0.18;
      hx = lerp(hx, impactX, t);
      hy = lerp(hy, impactY, t);
      hammerAngle = lerp(0, -PI * 0.72, t);
    } else {
      // fald væk fra hætteglasset (ned-højre), så der ikke sker et slag
      let fallX = hx + vialObj.w * 1.1;
      let fallY = hy + vialObj.h * 0.98;
      hx = lerp(hx, fallX, t);
      hy = lerp(hy, fallY, t);
      hammerAngle = lerp(0, PI * 0.66, t);
    }
  }

  push();
  translate(hx, hy);
  rotate(hammerAngle);
  rectMode(CENTER);

  // skaft (lodret)
  noStroke();
  fill(120, 70, 30);
  rect(0, 0, handleW, handleLen, 4);

  // hoved i toppen af skaftet
  noStroke();
  fill(70);
  // placér hovedet så centrum ligger lidt over toppen af skaftet
  let headY = -handleLen / 2 - headH / 2 + 6;
  rect(0, headY, headW, headH, 3);

  // lille klo/bagdel på venstre side af hovedet (uden streg)
  fill(60);
  rect(-headW * 0.42, headY + headH * 0.12, headW * 0.36, headH * 0.34, 3);

  rectMode(CORNER);
  pop();
}

function drawVial() {
  if (vialBroken) {
    drawBrokenVial();
    return;
  }

  push();
  translate(vialObj.x, vialObj.y);

  // flaske-krop
  noStroke();
  fill(40);
  // ydre glasskygge
  rectMode(CENTER);
  rect(0, 0, vialObj.w + 6, vialObj.h + 10, 6);

  // glas (let transparent)
  fill(220, 255, 240, 180);
  rect(0, 0, vialObj.w, vialObj.h, 6);

  // væske indeni (kraftig grøn)
  fill(50, 220, 80);
  rect(0, vialObj.h * 0.12, vialObj.w * 0.9, vialObj.h * 0.55, 4);

  // flaskehals
  fill(200);
  rect(0, -vialObj.h * 0.55, vialObj.w * 0.5, vialObj.h * 0.25, 4);

  // dødningehoved-symbol (centreret på flasken)
  push();
  translate(0, -vialObj.h * 0.02);
  // dødningehoved (skaleres med hætteglassets størrelse)
  let skullSize = constrain(vialObj.w * 0.45, 10, 36);
  fill(255);
  ellipse(0, -skullSize * 0.18, skullSize, skullSize);
  // øjne
  fill(0);
  let eyeX = skullSize * 0.18;
  let eyeY = -skullSize * 0.35;
  ellipse(-eyeX, eyeY, skullSize * 0.18, skullSize * 0.28);
  ellipse(eyeX, eyeY, skullSize * 0.18, skullSize * 0.28);
  // tænder (simpel rektangelblok)
  rectMode(CENTER);
  rect(0, skullSize * 0.18, skullSize * 0.45, skullSize * 0.18);

  // krydsede knogler skaleret
  stroke(255);
  strokeWeight(max(1, skullSize * 0.08));
  noFill();
  let bone = skullSize * 0.7;
  line(-bone, skullSize * 0.5, bone * 0.85, -skullSize * 0.12);
  line(-bone, -skullSize * 0.12, bone * 0.85, skullSize * 0.5);
  pop();

  rectMode(CORNER);
  pop();
}

function drawBrokenVial() {
  push();
  translate(vialObj.x, vialObj.y);

  noStroke();
  fill(60, 220, 80, 180);
  ellipse(0, vialObj.h * 0.22, vialObj.w * 1.4, vialObj.h * 0.35);

  fill(220, 255, 240, 180);
  triangle(-vialObj.w * 0.35, vialObj.h * 0.05, -vialObj.w * 0.08, -vialObj.h * 0.2, vialObj.w * 0.05, vialObj.h * 0.1);
  triangle(vialObj.w * 0.12, vialObj.h * 0.02, vialObj.w * 0.36, -vialObj.h * 0.18, vialObj.w * 0.42, vialObj.h * 0.12);
  triangle(-vialObj.w * 0.05, vialObj.h * 0.18, vialObj.w * 0.2, -vialObj.h * 0.02, vialObj.w * 0.34, vialObj.h * 0.26);

  pop();
}

function drawWalls() {
  let corridor = getBottomCorridorBounds();
  let corridorY = height - wallThickness;

  // tegn en tyk kant rundt om rummet for at simulere vægge
  noStroke();
  fill(100); // lysere grå
  // topvæg
  rect(0, 0, width, wallThickness);

  // venstre væg
  rect(0, 0, wallThickness, height);
  // højre væg
  rect(width - wallThickness, 0, wallThickness, height);

  if (currentScene === 2) {
    // bundvæg med en lille korridoråbning i midten
    rect(0, corridorY, corridor.x, wallThickness);
    rect(corridor.x + corridor.w, corridorY, width - (corridor.x + corridor.w), wallThickness);

    // korridorens sidevægge
    rect(corridor.x - 12, corridorY, 12, wallThickness);
    rect(corridor.x + corridor.w, corridorY, 12, wallThickness);
  } else {
    // lukket bundvæg i level 1
    rect(0, corridorY, width, wallThickness);
  }

  // vægskygger (indre) - simpelt skyggebånd i bunden
  fill(0, 25);
  if (currentScene === 2) {
    let shadowY = height - wallThickness * 1.3;
    let shadowH = wallThickness * 0.3;
    let leftShadowW = max(0, corridor.x - wallThickness);
    let rightShadowX = corridor.x + corridor.w;
    let rightShadowW = max(0, (width - wallThickness) - rightShadowX);

    rect(wallThickness, shadowY, leftShadowW, shadowH);
    rect(rightShadowX, shadowY, rightShadowW, shadowH);
  } else {
    rect(wallThickness, height - wallThickness * 1.3, width - wallThickness * 2, wallThickness * 0.3);
  }
  rect(wallThickness, wallThickness, wallThickness * 0.3, height - wallThickness * 2);
  rect(width - wallThickness * 1.3, wallThickness, wallThickness * 0.3, height - wallThickness * 2);

  // (highlight-bånd fjernet efter ønske)
}

function drawBox() {
  push();
  translate(boxObj.x, boxObj.y);
  rectMode(CENTER);
  
  // hoveddelen af kassen - mørkere brun pap
  fill(100, 65, 35);
  rect(0, 0, boxObj.size, boxObj.size);
  
  // pap-riller/tekstur på hovedkassen
  stroke(80, 50, 25);
  strokeWeight(2);
  line(-boxObj.size * 0.35, -boxObj.size * 0.35, -boxObj.size * 0.35, boxObj.size * 0.35);
  line(0, -boxObj.size * 0.35, 0, boxObj.size * 0.35);
  line(boxObj.size * 0.35, -boxObj.size * 0.35, boxObj.size * 0.35, boxObj.size * 0.35);
  
  rectMode(CORNER);
  pop();
}

function drawConsole(c) {
  // simpel cirkulær knap med sort kontur og rød fyld
  push();
  translate(c.x, c.y);
  ellipseMode(CENTER);

  // kontur
  stroke(0);
  strokeWeight(6);
  fill(180, 40, 40);
  circle(0, 0, c.w);

  // label centreret
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  let label = c.label;
  let labelLines = getConsoleLabelLines(label);
  let isMultiline = labelLines.length > 1;
  let labelSize = isMultiline
    ? constrain(c.w * 0.17, 10, 15)
    : constrain(c.w * 0.24, 13, 20);

  textSize(labelSize);
  textStyle(BOLD);
  if (isMultiline) {
    textLeading(labelSize * 0.95);
    text(labelLines.join('\n'), 0, -1);
  } else {
    text(label, 0, 0);
  }

  pop();
}

function getConsoleLabelLines(label) {
  if (label === 'Both/neither') {
    return ['Both/', 'neither'];
  }

  if (label.includes(' ')) {
    return label.split(' ');
  }

  return [label];
}
