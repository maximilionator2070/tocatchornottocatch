// To catch or not to catch
// Five-stage bug-catching game

let spiderImage;
let webImage;
let bugImages = [];

let bugX;
let bugY;
let bugVelocityX = 0;
let bugVelocityY = 0;

let score = 0;
let highScore = 0;

let stage = 1;
let bugsCaughtThisStage = 0;

let bugTimeLeft;
let bugTimeLimit;

let gameTimeLeft;
let gameStarted = false;
let gameOver = false;

let startingBugSize = 65;
let startingTime = 180;

let playButtonX;
let playButtonY;
let playButtonWidth = 150;
let playButtonHeight = 60;

function preload() {
  spiderImage = loadImage("spider.jpg");
  webImage = loadImage("webimage.jpg");

  bugImages[0] = loadImage("bug1.png");
  bugImages[1] = loadImage("bug2.png");
  bugImages[2] = loadImage("bug3.png");
  bugImages[3] = loadImage("bug4.png");
  bugImages[4] = loadImage("bug5.png");
}

function setup() {
  createCanvas(600, 600);

  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  noCursor();

  playButtonX = width / 2;
  playButtonY = height / 2 - 45;

  // Load the saved high score.
  let savedHighScore = getItem("spiderHighScore");

  if (savedHighScore !== null) {
    highScore = Number(savedHighScore);
  }
}

function draw() {
  image(webImage, width / 2, height / 2, width, height);

  if (!gameStarted) {
    drawStartScreen();
  } else if (!gameOver) {
    drawGame();
  } else {
    drawGameOverScreen();
  }

  // Draw the spider at the mouse position.
  image(spiderImage, mouseX, mouseY, 85, 85);
}

function drawStartScreen() {
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  rectMode(CENTER);

  fill(45, 45, 45, 240);
  stroke(255);
  strokeWeight(3);

  rect(
    playButtonX,
    playButtonY,
    playButtonWidth,
    playButtonHeight,
    12
  );

  noStroke();
  fill(255);

  textSize(28);
  text("PLAY", playButtonX, playButtonY);

  textSize(30);
  text(
    "To catch or not to catch",
    width / 2,
    playButtonY + 75
  );

  textSize(18);
  text(
    "High Score: " + highScore,
    width / 2,
    playButtonY + 120
  );

  rectMode(CORNER);
}

function drawGame() {
  // Count down the one-minute game timer.
  gameTimeLeft--;

  // End the game when one minute is finished.
  if (gameTimeLeft <= 0) {
    endGame();
    return;
  }

  // Information bar.
  fill(0, 0, 0, 170);
  rect(0, 0, width, 85);

  fill(255);
  textSize(20);

  text("Score: " + score, 75, 27);
  text("Time: " + ceil(gameTimeLeft / 60), width - 75, 27);
  text("Stage: " + stage + " / 5", width / 2, 27);

  // Each stage requires five more bugs than the previous stage.
  let bugsNeededThisStage = stage * 5;

  textSize(16);
  text(
    "Bugs caught: " +
      bugsCaughtThisStage +
      " / " +
      bugsNeededThisStage,
    width / 2,
    60
  );

  // Each stage's bug is 10% larger than the previous stage.
  let currentBugSize =
    startingBugSize * pow(1.10, stage - 1);

  // Only the Stage 5 bug moves away from the spider.
  if (stage === 5) {
    moveFinalBug();
  }

  image(
    bugImages[stage - 1],
    bugX,
    bugY,
    currentBugSize,
    currentBugSize
  );

  let distanceToBug = dist(mouseX, mouseY, bugX, bugY);

  // Catch the bug.
  if (distanceToBug < currentBugSize / 2) {
    score++;
    bugsCaughtThisStage++;

    if (bugsCaughtThisStage >= bugsNeededThisStage) {
      if (stage < 5) {
        stage++;
        bugsCaughtThisStage = 0;
        placeBug();
      } else {
        // After finishing Stage 5, continue at Stage 5
        // until the one-minute timer ends.
        bugsCaughtThisStage = 0;
        placeBug();
      }
    } else {
      placeBug();
    }
  } else {
    // Individual bugs still disappear if they are not caught in time.
    bugTimeLeft--;

    if (bugTimeLeft <= 0) {
      score = max(0, score - 1);
      placeBug();
    }
  }
}

function moveFinalBug() {
  let distanceToSpider = dist(mouseX, mouseY, bugX, bugY);

  // The final bug reacts when the spider gets close.
  if (distanceToSpider < 180) {
    let directionX = bugX - mouseX;
    let directionY = bugY - mouseY;

    let directionLength =
      sqrt(directionX * directionX + directionY * directionY);

    if (directionLength > 0) {
      directionX = directionX / directionLength;
      directionY = directionY / directionLength;

      // Move away from the spider.
      bugVelocityX += directionX * 0.35;
      bugVelocityY += directionY * 0.35;
    }
  }

  // Limit the final bug's speed.
  let speed =
    sqrt(
      bugVelocityX * bugVelocityX +
      bugVelocityY * bugVelocityY
    );

  let maximumSpeed = 3.5;

  if (speed > maximumSpeed) {
    bugVelocityX =
      (bugVelocityX / speed) * maximumSpeed;

    bugVelocityY =
      (bugVelocityY / speed) * maximumSpeed;
  }

  // Move the bug.
  bugX += bugVelocityX;
  bugY += bugVelocityY;

  // Gradually slow the bug down.
  bugVelocityX *= 0.94;
  bugVelocityY *= 0.94;

  // Keep the bug inside the canvas.
  if (bugX < 50 || bugX > width - 50) {
    bugVelocityX *= -1;
    bugX = constrain(bugX, 50, width - 50);
  }

  if (bugY < 110 || bugY > height - 50) {
    bugVelocityY *= -1;
    bugY = constrain(bugY, 110, height - 50);
  }
}

function drawGameOverScreen() {
  fill(0, 0, 0, 175);
  rect(0, 0, width, height);

  fill(255);
  textSize(42);
  text("Time's Up!", width / 2, height / 2 - 80);

  textSize(26);
  text("Your score: " + score, width / 2, height / 2 - 25);

  text(
    "High score: " + highScore,
    width / 2,
    height / 2 + 20
  );

  textSize(18);
  text(
    "Click to play again.",
    width / 2,
    height / 2 + 75
  );
}

function placeBug() {
  bugX = random(50, width - 50);
  bugY = random(110, height - 50);

  // Reset the final bug's movement.
  bugVelocityX = 0;
  bugVelocityY = 0;

  // Bugs disappear 35% faster at every new stage.
  bugTimeLimit =
    max(30, startingTime * pow(0.65, stage - 1));

  bugTimeLeft = bugTimeLimit;
}

function endGame() {
  gameOver = true;

  // Save the new high score if the player beat it.
  if (score > highScore) {
    highScore = score;
    storeItem("spiderHighScore", highScore);
  }
}

function mousePressed() {
  // Start the game when the Play button is clicked.
  if (!gameStarted) {
    let clickedPlayButton =
      mouseX > playButtonX - playButtonWidth / 2 &&
      mouseX < playButtonX + playButtonWidth / 2 &&
      mouseY > playButtonY - playButtonHeight / 2 &&
      mouseY < playButtonY + playButtonHeight / 2;

    if (clickedPlayButton) {
      score = 0;
      stage = 1;
      bugsCaughtThisStage = 0;
      gameTimeLeft = 60 * 60;
      gameStarted = true;
      gameOver = false;

      placeBug();
    }
  }

  // Restart after time runs out.
  else if (gameOver) {
    score = 0;
    stage = 1;
    bugsCaughtThisStage = 0;
    gameTimeLeft = 60 * 60;
    gameOver = false;

    placeBug();
  }
}
