// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

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
let points = hypotenuse - distance;
let oldPoints = points;

let goodX = x;
let goodY = y;

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
    let maxX = dxPoints[0][0];
    for (let i = 0; i < dxPoints.length; i++) {
        for (let j = 0; j < dxPoints[0]; j++) {
            if (dxPoints[i][1] > maxX){
                chosenDirectionX = dxPoints[i][0];
                maxX = dxPoints[i][1];
            }
        }
    }
    let maxY = dyPoints[0][0];
    for (let i = 0; i < dyPoints.length; i++) {
        for (let j = 0; j < dyPoints[0].length; j++) {
            if (dyPoints[i][1] > maxY){
                chosenDirectionY = dyPoints[i][0];
                maxY = dyPoints[i][1];
            }
        }
    }
}

// Function to update the canvas
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the ball
    drawBall();
    // Draw the hole
    drawHole();
  
    // Move the ball
    x += dx;
    y += dy;
  
    // Calculate distance and points
    distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);
    points = hypotenuse - distance;
  
    // Update direction
    calculateDirection();
    if (points > oldPoints) {
      dx = goodX;
      dy = goodY;
    } else {
      dx = chosenDirectionX;
      dy = chosenDirectionY;
    }
  
    dxPoints.push([dx, points]);
    dyPoints.push([dy, points]);
  
    // Update old points
    oldPoints = points;
  
    // Update text trackers
    document.getElementById("distance").innerHTML = distance.toFixed(2);
    document.getElementById("points").innerHTML = points.toFixed(2);
    document.getElementById("array").innerHTML = dxPoints.toFixed(2);
  
    // Reset ball and hole position if ball reaches the hole
    if (distance < ballRadius) {
      // Reset ball position
      x = canvas.width / 2;
      y = canvas.height / 2;
      // Reset hole position
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