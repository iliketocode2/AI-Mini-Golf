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

// wall properties
let wallWidth = 10;
let wallHeight = canvas.height / 1.3;
let wallX = (canvas.width / 2) - wallWidth / 2;
let wallY = 0;

let hypotenuse = Math.sqrt((canvas.width) ** 2 + (canvas.height) ** 2);
let distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);

let points = 0;
let attempts = 0;
let iterations = 0;
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

// draw wall
function drawRectangle() {
  ctx.fillStyle = '#fcec03';
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
    let num = findMax(pointsHistory);
    let iterationNum = pointsHistory[num][1];
    // replicate highest point path for half of steps
    if (iterations < iterationNum / 2){
      chosenDirectionX = runs[num][iterations][2]; // x, y, dx, dy
      chosenDirectionY = runs[num][iterations][3];
    }
    // create new path based on distance to hole
    else{
      chosenDirectionX = Math.random() * 2 - 1;
      chosenDirectionY = Math.random() * 2 - 1;
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

// find index of array with max points
function findMax(array) {
  let max = 0;
  let arrayToReturn = 0;
  for (let i = 0; i < array.length; i++) {
      if (array[i][0] > max){
        max = array[i][0];
        arrayToReturn = i;
      }
  }
  return arrayToReturn;
}

function resetRun(finalPoints){
  pointsHistory.push([finalPoints, iterations]);
  runs.push(runsData);
  // clear runsData array
  runsData = [];
  points = 0;
  x = startPosX;
  y = startPosY;
  dx = Math.random() * 2 - 1; // reset dx to new random value
  dy = Math.random() * 2 - 1;
  attempts++;
  iterations = 0;
}

// update the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall();
    drawHole();
    drawRectangle();
  
    // Move the ball
    x += dx;
    y += dy;
  
    // Calculate distance and points
    distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);
    points = (hypotenuse - distance) / 100;
  
    // Update direction
    calculateDirection();
    dx = chosenDirectionX;
    dy = chosenDirectionY;
  
    runsData.push([x, y, dx, dy]);
  
    // Update text trackers
    document.getElementById("distance").innerHTML = distance.toFixed(2);
    document.getElementById("points").innerHTML = points.toFixed(2);
    document.getElementById("attempts").innerHTML = attempts.toFixed(2);
    document.getElementById("iterations").innerHTML = iterations.toFixed(2);
    alert('before graph');
    drawGraph();
    alert('after graph');
    // Reset ball and hole position if ball reaches the hole
    if (distance < ballRadius) {
      resetRun(points);
      holeX = Math.random() * canvas.width;
      holeY = Math.random() * canvas.height;
    }
  
    // reset ball position if it goes out of bounds
    if ((x + dx > canvas.width - ballRadius || x + dx < ballRadius) || (y + dy > canvas.height - ballRadius || y + dy < ballRadius)) {
      resetRun(points);
    }

    // reset ball position if it hits wall
    if (isCollidingWithWall(x + dx, y + dy)) {
      resetRun(points - 1); // subtract a point for hitting the wall
    }
  
    iterations++;
    // Request the next frame
    requestAnimationFrame(draw);
}
  
// Start animation
draw();
