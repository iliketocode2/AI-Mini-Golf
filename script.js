// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Ball properties
let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = Math.random() * 2 - 1; // Change in x (speed), start with random value
let dy = Math.random() * 2 - 1;; // Change in y (speed), start with random value
const ballRadius = 5;

let holeX = (Math.random() * canvas.width);
let holeY = (Math.random() * canvas.height);

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

// Function to update the canvas
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the ball
  drawBall();
  //Draw the hole
  drawHole();

  // Update the ball's position
  x += dx;
  y += dy;

  //check collisions and relative distance to hole
  let distance = Math.sqrt((x - holeX) ** 2 + (y - holeY) ** 2);
  document.getElementById("distance").innerHTML = distance;

  //increase points based on distance to the hole
  let hypotenuse = Math.sqrt((canvas.width) ** 2 + (canvas.height) ** 2);
  let points = hypotenuse - distance;
  document.getElementById("points").innerHTML = points;
  
  if (distance < ballRadius){
    //reset ball position
    x = canvas.width / 2;
    y = canvas.height / 2;
    //reset hole position
    holeX = (Math.random() * canvas.width);
    holeY = (Math.random() * canvas.height);
  }

  // Reset ball position if it goes out of bounds
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    x = canvas.width / 2;
    dx = 1; //todo
  }
  if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
    y = canvas.height / 2;
    dy = 1; //todo
  }

  // Request the next frame
  requestAnimationFrame(draw);
}

// Start the animation
draw();