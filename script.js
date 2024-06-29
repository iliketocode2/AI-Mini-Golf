// main canvas
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
// graph of points canvas
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


//distance properties
let hypotenuse = Math.sqrt((canvas.width) ** 2 + (canvas.height) ** 2);
let distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);
let distanceToBooster = Math.sqrt((x - bX) ** 2 + (y - bY) ** 2);

let indexOfHighestPoint = 0;
let indexOfHighestPointRun = 0;
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
  // ctx.fillStyle = "#f79a05";
  // ctx.beginPath();
  // ctx.arc(bX, bY, 85, 0, Math.PI * 2);
  // ctx.fill();
  // ctx.closePath();
  // ctx.fillStyle = "#f7e705";
  // ctx.beginPath();
  // ctx.arc(bX, bY, 55, 0, Math.PI * 2);
  // ctx.fill();
  // ctx.closePath();
  // ctx.fillStyle = "#b5d916";
  // ctx.beginPath();
  // ctx.arc(bX, bY, 25, 0, Math.PI * 2);
  // ctx.fill();
  // ctx.closePath();
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
  if (attempts === 0){
    chosenDirectionX = Math.random() * 2 - 1;
    chosenDirectionY = Math.random() * 2 - 1;
  }
  else{

    //find highest point value achieved by the chosen run, follow path until that point
    if (iterations < indexOfHighestPoint / 2){
      chosenDirectionX = runs[indexOfHighestPointRun][iterations][2]; // x, y, dx, dy, points, highestPoint
      chosenDirectionY = runs[indexOfHighestPointRun][iterations][3];
    }
    // create new path based on distance to hole
    else{
      if (directionChooserCounter === 0){
        chosenDirectionX = Math.random() * 2 - 1;
        chosenDirectionY = Math.random() * 2 - 1;
        directionChooserCounter = 5;
      }
    }
  }
}

function calculatePoints(){
  distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);
  distanceToBooster = Math.sqrt((x - bX) ** 2 + (y - bY) ** 2);

  /* when on left side of wall, get points for getting closer to booster, 
  on right side of wall, get points for getting closer to hole. loose points 
  for longer paths (number of iterations)*/
  if (x - ballRadius < wallX + wallWidth){
    points = (hypotenuse - distanceToBooster) - (iterations / 100);
  }
  else{
    points = (hypotenuse - distance) - (iterations / 100);
  }

  //see if the current point is higher than the highestPoint
  for (let i = 0; i < runsData.length; i++){
    if (runsData[i][5] > points){
      highestPoint = runsData[i][5];
      indexOfHighestPoint = iterations;
      indexOfHighestPointRun = attempts;
    }
  }
}

function isCollidingWithWall(x, y) {
  return x + ballRadius > wallX && x - ballRadius < wallX + wallWidth &&
         y + ballRadius > wallY && y - ballRadius < wallY + wallHeight;
}

// draw the graph
function drawGraph() {
  graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

  //switch origin to lowerlefthand corner
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

function resetRun(finalPoints){
  pointsHistory.push([finalPoints, iterations]);
  runs.push(runsData);
  // clear runsData array
  runsData = [];
  points = 0;
  highestPoint = 0;
  x = startPosX;
  y = startPosY;
  bX = 50;
  bY = 50;
  dx = Math.random() * 2 - 1; // reset dx to new random value
  dy = Math.random() * 2 - 1;
  attempts++;
  directionChooserCounter = 5;
  iterations = 0;
}

// update the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBooster();
    drawBall();
    drawHole();
    drawRectangle();
    
  
    // Move the ball
    x += dx;
    y += dy;
  
    // Calculate distance and points
    calculatePoints();
  
    // Update direction
    calculateDirection();
    dx = chosenDirectionX;
    dy = chosenDirectionY;
  
    runsData.push([x, y, dx, dy, points, highestPoint]);
  
    // Update text trackers
    document.getElementById("distance").innerHTML = distance.toFixed(2);
    document.getElementById("points").innerHTML = points.toFixed(2);
    document.getElementById("attempts").innerHTML = attempts.toFixed(2);
    document.getElementById("iterations").innerHTML = iterations.toFixed(2);

    drawGraph();

    // Reset ball and hole position if ball reaches the hole
    if (distance < ballRadius) {
      resetRun(points);
      holeX = Math.random() * canvas.width;
      holeY = Math.random() * canvas.height;
    }

    // Reset booster position if ball reaches the booster
    if (distanceToBooster < ballRadius) {
      bY = 150;
    }
  
    // reset ball position if it goes out of bounds
    if ((x + dx > canvas.width - ballRadius || x + dx < ballRadius) || (y + dy > canvas.height - ballRadius || y + dy < ballRadius)) {
      resetRun(points);
    }

    // reset ball position if it hits wall
    if (isCollidingWithWall(x + dx, y + dy)) {
      resetRun(points); 
    }
  
    directionChooserCounter--;
    iterations++;
    // Request the next frame
    requestAnimationFrame(draw);
}
  
// Start animation
draw();
