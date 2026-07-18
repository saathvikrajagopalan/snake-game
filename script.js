const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const overlayEl = document.getElementById('overlay');
const restartBtn = document.getElementById('restartBtn');

const tileCount = 20;
const tileSize = canvas.width / tileCount;
const initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
const fruitTypes = [
  { name: 'cherry', emoji: '🍒', points: 10, color: '#ff2e5b' },
  { name: 'apple', emoji: '🍎', points: 20, color: '#ff3d2f' },
  { name: 'strawberry', emoji: '🍓', points: 30, color: '#ff4f75' },
  { name: 'watermelon', emoji: '🍉', points: 50, color: '#21b15a' }
];

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = null;
let score = 0;
let timeLeft = 180;
let gameOver = false;
let gameStarted = false;
let loopInterval = null;
let timerInterval = null;

function resetGame() {
  snake = initialSnake.map((segment) => ({ ...segment }));
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  timeLeft = 180;
  gameOver = false;
  gameStarted = false;
  updateHud();
  overlayEl.classList.remove('hidden');
  overlayEl.textContent = 'Press any arrow key to start';
  clearInterval(loopInterval);
  clearInterval(timerInterval);
  spawnFood();
  draw();
}

function updateHud() {
  scoreEl.textContent = score;
  timerEl.textContent = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
}

function spawnFood() {
  let newFood = null;

  while (!newFood) {
    const candidate = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };

    const isOnSnake = snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y);
    if (!isOnSnake) {
      newFood = {
        ...candidate,
        ...fruitTypes[Math.floor(Math.random() * fruitTypes.length)]
      };
    }
  }

  food = newFood;
}

function startGame() {
  if (gameStarted) {
    return;
  }

  gameStarted = true;
  overlayEl.classList.add('hidden');
  loopInterval = setInterval(step, 220);
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateHud();

    if (timeLeft <= 0) {
      endGame('Time is up!');
    }
  }, 1000);
}

function endGame(message) {
  clearInterval(loopInterval);
  clearInterval(timerInterval);
  gameOver = true;
  overlayEl.classList.remove('hidden');
  overlayEl.textContent = message;
}

function step() {
  direction = nextDirection;
  const head = { ...snake[0] };
  head.x += direction.x;
  head.y += direction.y;

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    endGame('Game over!');
    return;
  }

  snake.unshift(head);

  if (food && head.x === food.x && head.y === food.y) {
    score += food.points;
    updateHud();
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#11220b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < tileCount; i += 1) {
    for (let j = 0; j < tileCount; j += 1) {
      if ((i + j) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
      }
    }
  }

  snake.forEach((segment, index) => {
    const x = segment.x * tileSize;
    const y = segment.y * tileSize;
    const isHead = index === 0;
    const gradient = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
    gradient.addColorStop(0, '#fff2a8');
    gradient.addColorStop(0.5, '#d4af37');
    gradient.addColorStop(1, '#8a6a0b');
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

    if (isHead) {
      ctx.fillStyle = '#3c2d00';
      ctx.fillRect(x + 4, y + 4, 4, 4);
      ctx.fillRect(x + tileSize - 8, y + 4, 4, 4);
      ctx.fillRect(x + 4, y + tileSize - 8, 4, 4);
      ctx.fillRect(x + tileSize - 8, y + tileSize - 8, 4, 4);
    }
  });

  if (food) {
    const x = food.x * tileSize + tileSize / 2;
    const y = food.y * tileSize + tileSize / 2;
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.emoji, x, y);
  }
}

function handleKeydown(event) {
  const keyMap = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  };

  const newDirection = keyMap[event.key];
  if (!newDirection) {
    return;
  }

  event.preventDefault();
  const isOpposite = newDirection.x === -direction.x && newDirection.y === -direction.y;
  if (!isOpposite) {
    nextDirection = newDirection;
  }

  if (!gameStarted) {
    startGame();
  }
}

window.addEventListener('keydown', handleKeydown);
restartBtn.addEventListener('click', () => {
  resetGame();
  startGame();
});

resetGame();
draw();
