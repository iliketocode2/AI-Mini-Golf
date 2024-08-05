const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const cols = canvas.width / gridSize;
const rows = canvas.height / gridSize;

const grid = [];
let ballPosition = { x: 0, y: 0 };
let holePosition = null;

let runsData = [];
let attempts = 1;

// Q-learning parameters
const learningRate = 0.1;
const discountFactor = 0.9;
const explorationRate = 0.1;
const qTable = {};
const actions = ['up', 'down', 'left', 'right'];

//Graph values
let attemptsData = [];
let stepCount = 0;

/*-------------------------------------Drawing Control and Game start----------------------------------------*/
function initializeGrid() {
  for (let i = 0; i < cols; i++) {
      grid[i] = [];
      for (let j = 0; j < rows; j++) {
          grid[i][j] = 'empty';
      }
  }
}

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
    const x = (holePosition.x + 0.5) * gridSize;
    const y = (holePosition.y + 0.5) * gridSize;
    const radius = gridSize / 3;

    const gradient = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'black');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBall() {
  const ballColor = '#49d5f5';
  const x = (ballPosition.x + 0.5) * gridSize;
  const y = (ballPosition.y + 0.5) * gridSize;
  const radius = gridSize / 3;

  // Draw the ball
  ctx.fillStyle = ballColor;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
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


//-----------------------------------Q-learning-----------------------------------

// Helper function to get a string representation of a state
function getStateString(x, y) {
    return `${x},${y}`;
}

// Initialize Q-table
function initializeQTable() {
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const state = getStateString(x, y);
            qTable[state] = {};
            actions.forEach(action => {
                qTable[state][action] = 0;
            });
        }
    }
}

// Choose an action using epsilon-greedy policy
function chooseAction(state) {
    if (Math.random() < explorationRate) {
        return actions[Math.floor(Math.random() * actions.length)];
    } else {
        const stateActions = qTable[state];
        return Object.keys(stateActions).reduce((a, b) => stateActions[a] > stateActions[b] ? a : b);
    }
}

function formatReward(reward) {
  let rewardString = reward.toString();
  if (rewardString.length > 4) {
    return rewardString.slice(0, 4); // Truncate to 4 characters
  } else {
    return rewardString.padStart(4, '0'); // Pad with leading zeros if less than 4 characters
  }
}

// Update Q-value
function updateQValue(state, action, reward, nextState) {
  document.getElementById('state').innerHTML = state;
  // document.getElementById('action').innerHTML = action;
  document.getElementById('points').innerHTML = formatReward(reward);
  document.getElementById('steps').innerHTML = stepCount;

  const currentQ = qTable[state][action];
  const nextMaxQ = Math.max(...Object.values(qTable[nextState]));
  const newQ = currentQ + learningRate * (reward + discountFactor * nextMaxQ - currentQ);
  qTable[state][action] = newQ;
}

// Calculate reward
function calculateReward(oldPosition, newPosition) {
  if (grid[newPosition.x][newPosition.y] === 'wall') {
      return -100; // Large negative reward for hitting a wall
  }
  
  if (!holePosition) {
      return 0; // No reward if there's no hole
  }
  
  const oldDistance = Math.sqrt((oldPosition.x - holePosition.x)**2 + (oldPosition.y - holePosition.y)**2);
  const newDistance = Math.sqrt((newPosition.x - holePosition.x)**2 + (newPosition.y - holePosition.y)**2);
  
  if (newPosition.x === holePosition.x && newPosition.y === holePosition.y) {
      return 100; // Large positive reward for reaching the hole
  }
  
  return oldDistance - newDistance; // Positive reward for getting closer, negative for moving away
}

function moveBallAI() {
  const currentState = getStateString(ballPosition.x, ballPosition.y);
  const action = chooseAction(currentState);
  const oldPosition = {...ballPosition};
  const newPosition = {...ballPosition};
  
  switch (action) {
      case 'up': newPosition.y = Math.max(0, newPosition.y - 1); break;
      case 'down': newPosition.y = Math.min(rows - 1, newPosition.y + 1); break;
      case 'left': newPosition.x = Math.max(0, newPosition.x - 1); break;
      case 'right': newPosition.x = Math.min(cols - 1, newPosition.x + 1); break;
  }
  
  // Only update the position if it's not a wall
  if (grid[newPosition.x][newPosition.y] !== 'wall') {
      ballPosition = newPosition;
  }
  
  const reward = calculateReward(oldPosition, ballPosition);
  const newState = getStateString(ballPosition.x, ballPosition.y);
  
  updateQValue(currentState, action, reward, newState);
  
  // Store data for this step
  runsData.push([ballPosition.x, ballPosition.y, action, reward, qTable[currentState][action]]);
  
  stepCount++;
    
  drawScene();
  checkGameState();
}


/*------------------------------------Game Control------------------------------------*/

function checkGameState() {
  if (!holePosition) {
      return;
  }

  const ballState = getStateString(ballPosition.x, ballPosition.y);
  const holeState = getStateString(holePosition.x, holePosition.y);

  if (ballState === holeState) {
      attemptsData.push(stepCount);
      logRunsData();
      drawGraph();
      
      ballPosition = { x: 0, y: 0 };
      stepCount = 0;
      attempts++;
      document.getElementById('attempt').innerHTML = attempts;
      drawScene();
  }
}

function resetGrid() {
  ballPosition = { x: 0, y: 0 };
  initializeQTable();
  runsData = [];
  attemptsData = [];
  stepCount = 0;
  drawScene();
}

// Main game loop
function gameLoop() {
  moveBallAI();
  setTimeout(gameLoop, 10); // Adjust the delay as needed
}

// Initialize and start the game
function startGame() {
  if (!holePosition) {
      alert("Please place a hole on the grid before starting the AI.");
      return;
  }
  resetGrid();
  drawGraph();
  gameLoop();
}

canvas.addEventListener('click', handleCanvasClick);
document.getElementById('resetGrid').addEventListener('click', resetGrid);
document.getElementById('startSimulation').addEventListener('click', startGame);

initializeGrid();
drawScene();

//-----------------------------------Graph Update-----------------------------------
function drawGraph() {
  const graphCanvas = document.getElementById('graphCanvas');
  const graphCtx = graphCanvas.getContext('2d');
  
  graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
  
  const maxSteps = Math.max(...attemptsData);
  const graphHeight = graphCanvas.height - 20;
  const graphWidth = graphCanvas.width / 1.1;
  
  graphCtx.strokeStyle = '#2F4F4F';
  graphCtx.beginPath();
  graphCtx.moveTo(40, 10);
  graphCtx.lineTo(40, graphHeight);
  graphCtx.lineTo(graphWidth, graphHeight);
  graphCtx.stroke();
  
  if (attemptsData.length > 1) {
      graphCtx.beginPath();
      graphCtx.moveTo(40, graphHeight + 20 - (attemptsData[0] / maxSteps) * graphHeight);
      
      for (let i = 1; i < attemptsData.length; i++) {
          const x = 40 + (i / (attemptsData.length - 1)) * (graphWidth - 40);
          const y = graphHeight - (attemptsData[i] / maxSteps) * graphHeight;
          graphCtx.lineTo(x, y);
      }
      
      graphCtx.strokeStyle = 'blue';
      graphCtx.stroke();
  }
  
  // Add labels
  graphCtx.fillStyle = 'black';
  graphCtx.font = '12px Arial';
  graphCtx.fillText('Steps', 2, graphCanvas.height / 2);
  graphCtx.fillText('Attempts', graphWidth / 2, graphCanvas.height - 2);
}

//-----------------------------------Console log Info Update-----------------------------------
function logRunsData() {
  console.log('runsData:');
  runsData.forEach((dataPoint, index) => {
    console.log(`Step ${index + 1}: x=${dataPoint[0]}, y=${dataPoint[1]}, dx=${dataPoint[2]}, dy=${dataPoint[3]}, points=${dataPoint[4]}, highestPoint=${dataPoint[5]}`);
  });
}