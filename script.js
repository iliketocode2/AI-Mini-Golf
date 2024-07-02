const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const graphCanvas = document.getElementById('graphCanvas');
const graphCtx = graphCanvas.getContext('2d');

// Ball properties
let startPosX = 10;
let startPosY = 10;
let x = startPosX;
let y = startPosY;
let dx = Math.random() * 2 - 1; // Change in x (speed), start with random value
let dy = Math.random() * 2 - 1; // Change in y (speed), start with random value
const ballRadius = 5;

// hole properties
let holeX = canvas.width - 50;
let holeY = canvas.height / 2;

// booster properties
let bX = 50;
let bY = 50;

// wall properties
let wallWidth = 10;
let wallHeight = canvas.height / 1.3;
let wallX = (canvas.width / 2) - wallWidth / 2;
let wallY = 0;

// distance properties
const hypotenuse = Math.sqrt((canvas.width) ** 2 + (canvas.height) ** 2);

let distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);
let distanceToBooster = Math.sqrt((x - bX) ** 2 + (y - bY) ** 2);

// booster positions array
const boosterPositions = [
  {x: 50, y: 50},
  {x: 50, y: 100},
  {x: 50, y: 150},
  {x: canvas.width / 2, y: 175}
];

let numBoostersHit = 0;
let highestPoint = 0;
let points = 0;
let attempts = 0;
let iterations = 0;
let directionChooserCounter = 5;

// array to store the points values for the graph
let pointsHistory = [];
// array to store each run's points: x, y, dx, dy
let runsData = [];
// array to store each run
let runs = [];
// array to store highest points achieved in runs
let highestPoints = [];
// variable to store the highest point overall and its run index
let overallHighestPoint = 0;
let overallHighestRunIndex = -1;
let overallHighestPointIndex = -1;

/*-----------------------------------------------------------------------------*/

// draw hole
function drawHole() {
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(holeX, holeY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

// draw booster
function drawBooster() {
  ctx.fillStyle = "#4dd916";
  ctx.beginPath();
  ctx.arc(bX, bY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

// draw wall
function drawRectangle() {
  ctx.fillStyle = '#f70505';
  ctx.fillRect(wallX, wallY, wallWidth, wallHeight);
}

// draw ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
}

// initialize direction choosing elements
let chosenDirectionX = 0;
let chosenDirectionY = 0;

function calculateDirection() {
  if (attempts === 0 || overallHighestRunIndex === -1) {
    chosenDirectionX = Math.random() * 2 - 1;
    chosenDirectionY = Math.random() * 2 - 1;
  } else {
    if (iterations < overallHighestPointIndex) {
      const bestRun = runs[overallHighestRunIndex];
      chosenDirectionX = bestRun[iterations][2]; // dx
      chosenDirectionY = bestRun[iterations][3]; // dy
    } else if (directionChooserCounter <= 0) {
      chosenDirectionX = Math.random() * 2 - 1;
      chosenDirectionY = Math.random() * 2 - 1;
      directionChooserCounter = 5;
    }
  }
  
  directionChooserCounter--;
}

let boosterBonus = 1000; //  bonus for hitting a booster
let pointMultiplier = 1; // starts at 1, increases with each booster hit

function calculatePoints() {
  // Base points calculation
  points = (x - ballRadius < wallX + wallWidth) 
    ? (hypotenuse - distanceToBooster) * 2 
    : (hypotenuse - distance) * 2;
  
  points = (points - (iterations / 100)) * pointMultiplier;

  // Check if a booster was hit
  if (distanceToBooster < ballRadius + 5) {
    points += boosterBonus * numBoostersHit;
    pointMultiplier += 0.5;
    numBoostersHit++;
  }

  highestPoint = Math.max(highestPoint, points);
}

function isCollidingWithWall(x, y) {
  return x + ballRadius + 1 > wallX && x - ballRadius - 1 < wallX + wallWidth &&
         y + ballRadius + 1 > wallY && y - ballRadius - 1 < wallHeight;
}

function drawGraph() {
  graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

  // switch origin to lowerlefthand corner
  graphCtx.save();
  graphCtx.translate(0, graphCanvas.height);
  graphCtx.scale(1, -1);

  // Define the graph properties
  const maxPoints = Math.max(...pointsHistory.map(p => p[0]));
  const graphHeight = graphCanvas.height;
  const graphWidth = graphCanvas.width;
  const pointsLength = pointsHistory.length;

  // Set up the graph style
  graphCtx.strokeStyle = '#0095DD';
  graphCtx.lineWidth = 2;

  // Begin the graph path
  graphCtx.beginPath();
  graphCtx.moveTo(0, pointsHistory[0]);
  // draw points on the graph
  for (let i = 0; i < pointsLength; i++) {
    const x = (i / pointsLength) * graphWidth;
    const y = (pointsHistory[i][0] / maxPoints) * graphHeight;
    if (i === 0) {
      graphCtx.moveTo(x, y);
    } else {
      graphCtx.lineTo(x, y);
    }
  }
  // draw the graph path
  graphCtx.stroke();
  graphCtx.restore();
}

function logRunsData() {
  console.log('runsData:');
  runsData.forEach((dataPoint, index) => {
    console.log(`Step ${index + 1}: x=${dataPoint[0]}, y=${dataPoint[1]}, dx=${dataPoint[2]}, dy=${dataPoint[3]}, points=${dataPoint[4]}, highestPoint=${dataPoint[5]}`);
  });
}

function resetRun(finalPoints) {
  pointsHistory.push([finalPoints, iterations]);
  runs.push(runsData);
  
  let runHighestPoint = Math.max(...runsData.map(d => d[5]));
  if (runHighestPoint > overallHighestPoint) {
    overallHighestPoint = runHighestPoint;
    overallHighestRunIndex = runs.length - 1;
    overallHighestPointIndex = runsData.findIndex(d => d[5] === runHighestPoint);
  }
  
  console.log('Run reset:', runsData);
  logRunsData();
  
  runsData = [];
  [x, y] = [startPosX, startPosY];
  [bX, bY] = [boosterPositions[0].x, boosterPositions[0].y];
  [dx, dy] = [Math.random() * 2 - 1, Math.random() * 2 - 1];
  [points, highestPoint, numBoostersHit, pointMultiplier] = [0, 0, 0, 1];
  attempts++;
  directionChooserCounter = 5;
  iterations = 0;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);
  distanceToBooster = Math.sqrt((x - bX) ** 2 + (y - bY) ** 2);

  drawBooster();
  drawBall();
  drawHole();
  drawRectangle();

  calculateDirection();
  calculatePoints();

  [dx, dy] = [chosenDirectionX, chosenDirectionY];
  x += dx;
  y += dy;

  runsData.push([x, y, dx, dy, points, highestPoint]);

  // Update text trackers
  document.getElementById("distance").innerHTML = distance.toFixed(2);
  document.getElementById("points").innerHTML = points.toFixed(2);
  document.getElementById("attempts").innerHTML = attempts;
  document.getElementById("iterations").innerHTML = iterations;

  drawGraph();

  // Reset conditions
  if (distance < ballRadius) {
    resetRun(points);
    [holeX, holeY] = [Math.random() * canvas.width, Math.random() * canvas.height];
  }

  if (distanceToBooster < ballRadius + 10 && numBoostersHit < boosterPositions.length) {
    [bX, bY] = [boosterPositions[numBoostersHit].x, boosterPositions[numBoostersHit].y];
  }

  if ((x + dx > canvas.width - ballRadius || x + dx < ballRadius) || 
      (y + dy > canvas.height - ballRadius || y + dy < ballRadius) ||
      isCollidingWithWall(x + dx, y + dy)) {
    resetRun(points);
  }

  iterations++;
  requestAnimationFrame(draw);
}

// Start animation
draw();