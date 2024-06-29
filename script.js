// main canvas
const canvas = document.getElementById('myCanvas');
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
let wallX = (canvas.width / 2) - wallWidth;
let wallY = 0;

let hypotenuse = Math.sqrt((canvas.width) ** 2 + (canvas.height) ** 2);
let distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);

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
  ctx.arc(holeX, holeY, 5, 0, 360);
  ctx.fill();
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
  let directions = [
    { dx: 1, dy: 0 },//right
    { dx: -1, dy: 0 },//left
    { dx: 0, dy: 1 },//up
    { dx: 0, dy: -1 },//down
    { dx: 1, dy: 1 },//RU
    { dx: -1, dy: -1 },//LU
    { dx: 1, dy: -1 },//RD
    { dx: -1, dy: 1 },//LD
  ];

  let bestDirection = directions[0];
  let bestPoints = distance;

  if (attempts === 0){
    chosenDirectionX = Math.random() * 2 - 1;
    chosenDirectionY = Math.random() * 2 - 1;
  }
  else{
    let num = findMax(pointsHistory);
    // replicate highest point path for first 50 steps
    if (iterations < 50){
      chosenDirectionX = runs[num][iterations][2]; // x, y, dx, dy
      chosenDirectionY = runs[num][iterations][3];
    }
    // create new path based on distance to hole
    else{
      for (let i of directions) {
        let newX = x + i.dx;
        let newY = y + i.dy;
        let newDistance = Math.sqrt((newX - holeX) ** 2 + (newY - holeY) ** 2);
    
        // check if the new position is closer to the hole and not colliding with the wall
        if (newDistance < bestPoints && !isCollidingWithWall(newX, newY)) {
          bestDirection = i;
          bestPoints = newDistance;
        }
      }
      chosenDirectionX = bestDirection.dx;
      chosenDirectionY = bestDirection.dy;
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
  const maxPoints = Math.max(...pointsHistory);
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
      const y = graphHeight - (pointsHistory[i] / maxPoints) * graphHeight;
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


// find index of array witn max points
function findMax(array) {
  let max = 0;
  let arrayToReturn = 0;
  for (let i = 0; i < array.length; i++) {
      if (array[i] > max){
        max = array[i];
        arrayToReturn = i;
      }
  }
  return arrayToReturn;
}

function resetRun(finalPoints){
  pointsHistory.push(finalPoints);
  runs.push(runsData);
  // clear runsData array
  runsData.length = 0
  points = 0;
  x = startPosX;
  y = startPosY;
  dx = chosenDirectionX;
  dy = chosenDirectionY;
  attempts++;
  iterations = 0;
}

// Function to update the canvas
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

    drawGraph();

    // Reset ball and hole position if ball reaches the hole
    if (distance < ballRadius) {
      x = canvas.width / 2;
      y = canvas.height / 2;
      holeX = Math.random() * canvas.width;
      holeY = Math.random() * canvas.height;
    }
  
    // Reset ball position if it goes out of bounds
    if ((x + dx > canvas.width - ballRadius || x + dx < ballRadius) || (y + dy > canvas.height - ballRadius || y + dy < ballRadius)) {
      resetRun(points);
    }

    // reset ball position if it hits wall
    if (isCollidingWithWall(x + dx, y + dy)) {
      if (x + dx > wallX - ballRadius && x + dx < wallX + wallWidth + ballRadius) {
        if (y + dy > wallY - ballRadius && y + dy < wallY + ballRadius + wallHeight) {
          points -= 1;
          resetRun(points);
        }
      }
    }
  
    // Request the next frame
    requestAnimationFrame(draw);
    iterations++;
  }
  
  // Start animation
  draw();