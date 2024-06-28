// main canvas
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
// graph of points canvas
const graphCanvas = document.getElementById('graphCanvas');
const graphCtx = graphCanvas.getContext('2d');

// Ball properties
let x = canvas.width / 2;
let y = canvas.height / 2;

let dx = Math.random() * 2 - 1; // Change in x (speed), start with random value
let dy = Math.random() * 2 - 1; // Change in y (speed), start with random value
const ballRadius = 5;

// position and distance variables
let holeX = (Math.random() * canvas.width);
let holeY = (Math.random() * canvas.height);
let hypotenuse = Math.sqrt((canvas.width) ** 2 + (canvas.height) ** 2);
let distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);
let points = (hypotenuse - distance) / 100;
let oldPoints = points;

// Arrays to store the points values for the graph
let pointsHistory = [];

//draw hole
function drawHole() {
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(holeX, holeY, 5, 0, 360);
  ctx.fill();
}

// Function to draw the ball
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
let dxPoints = [
    [dx, points]
];
let dyPoints = [
    [dy, points]
];

function calculateDirection(){
    let maxXpoints = dxPoints[0][0];
    for (let i = 0; i < dxPoints.length; i++) {
        for (let j = 0; j < dxPoints[0]; j++) {
            if (dxPoints[i][1] > maxXpoints){
                chosenDirectionX = dxPoints[i][0];
                maxXpoints = dxPoints[i][1];
            }
        }
    }
    let maxYpoints = dyPoints[0][0];
    for (let i = 0; i < dyPoints.length; i++) {
        for (let j = 0; j < dyPoints[0].length; j++) {
            if (dyPoints[i][1] > maxYpoints){
                chosenDirectionY = dyPoints[i][0];
                maxYpoints = dyPoints[i][1];
            }
        }
    }
}


// Function to draw the graph
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


// calculate mean of points
function calculateMean(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
      sum += array[i];
  }
  return sum / array.length;
}

// Function to update the canvas
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall();
    drawHole();
  
    // Move the ball
    x += dx;
    y += dy;
  
    // Calculate distance and points
    distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);
    points = (hypotenuse - distance) / 100;
  
    // Update direction
    calculateDirection();
    if (!(points > oldPoints)) {
      dx = chosenDirectionX;
      dy = chosenDirectionY;
    }
  
    dxPoints.push([dx, points]);
    dyPoints.push([dy, points]);
    oldPoints = points;
  
    // Update text trackers
    document.getElementById("distance").innerHTML = distance.toFixed(2);
    document.getElementById("points").innerHTML = points.toFixed(2);
    // document.getElementById("array").innerHTML = dxPoints.toFixed(2);
    
    pointsHistory.push(points);

    drawGraph();

    // Reset ball and hole position if ball reaches the hole
    if (distance < ballRadius) {
      x = canvas.width / 2;
      y = canvas.height / 2;
      holeX = Math.random() * canvas.width;
      holeY = Math.random() * canvas.height;
    }
  
    // Reset ball position if it goes out of bounds
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
      x = canvas.width / 2;
      dx = Math.random() * 2 - 1;
    }
    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
      y = canvas.height / 2;
      dy = Math.random() * 2 - 1;
    }
  
    // Request the next frame
    requestAnimationFrame(draw);
  }
  
  // Start the animation
  draw();