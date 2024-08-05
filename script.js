const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const cols = canvas.width / gridSize;
const rows = canvas.height / gridSize;

const grid = [];
let ballPosition = { x: 0, y: 0 };
let holePosition = null;

function initializeGrid() {
    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i][j] = 'empty';
        }
    }
}

/*-----------------------------------------------------------------------------*/

function drawGrid() {
  ctx.strokeStyle = '#bdc3c7';
  ctx.lineWidth = 0.5;

  for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();
  }

  for (let j = 0; j <= rows; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * gridSize);
      ctx.lineTo(canvas.width, j * gridSize);
      ctx.stroke();
  }
}

function drawWalls() {
  ctx.fillStyle = '#34495e';
  for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
          if (grid[i][j] === 'wall') {
              ctx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
          }
      }
  }
}

function drawHole() {
  if (holePosition) {
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(
          (holePosition.x + 0.5) * gridSize,
          (holePosition.y + 0.5) * gridSize,
          gridSize / 3,
          0,
          Math.PI * 2
      );
      ctx.fill();
  }
}

function drawBall() {
  ctx.fillStyle = '#0095DD';
  ctx.beginPath();
  ctx.arc(
      (ballPosition.x + 0.5) * gridSize,
      (ballPosition.y + 0.5) * gridSize,
      gridSize / 3,
      0,
      Math.PI * 2
  );
  ctx.fill();
}

function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / gridSize);
  const y = Math.floor((event.clientY - rect.top) / gridSize);

  const drawMode = document.getElementById('drawMode').value;

  if (drawMode === 'wall') {
      grid[x][y] = grid[x][y] === 'wall' ? 'empty' : 'wall';
  } else if (drawMode === 'hole') {
      holePosition = { x, y };
  }

  drawScene();
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawWalls();
  drawHole();
  drawBall();
}

function resetGrid() {
  initializeGrid();
  holePosition = null;
  ballPosition = { x: 0, y: 0 };
  drawScene();
}

function moveBall(direction) {
  const newPosition = { ...ballPosition };
  switch (direction) {
      case 'up': newPosition.y--; break;
      case 'down': newPosition.y++; break;
      case 'left': newPosition.x--; break;
      case 'right': newPosition.x++; break;
  }
  
  if (newPosition.x >= 0 && newPosition.x < cols &&
      newPosition.y >= 0 && newPosition.y < rows &&
      grid[newPosition.x][newPosition.y] !== 'wall') {
      ballPosition = newPosition;
  }
  
  drawScene();
  checkGameState();
}

function checkGameState() {
  if (ballPosition.x === holePosition.x && ballPosition.y === holePosition.y) {
      alert('Goal reached!');
      resetGrid();
  }
}

canvas.addEventListener('click', handleCanvasClick);
document.getElementById('resetGrid').addEventListener('click', resetGrid);

initializeGrid();
drawScene();

// Temp controls for testing
document.addEventListener('keydown', (event) => {
  switch (event.key) {
      case 'ArrowUp': moveBall('up'); break;
      case 'ArrowDown': moveBall('down'); break;
      case 'ArrowLeft': moveBall('left'); break;
      case 'ArrowRight': moveBall('right'); break;
  }
});

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
// draw();