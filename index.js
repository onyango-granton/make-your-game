const gameDiv = document.getElementById('game_canvas');

const arena = createMatrix(12, 20);

const colors = [
  null,
  'color-1',
  'color-2',
  'color-3',
  'color-4',
  'color-5',
  'color-6',
  'color-7'
];

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0
};

let pauseGameState = false;
let isGameOver = false;

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === 'T') return [[0,6,0],[6,6,6],[0,0,0]];
  if (type === 'O') return [[4,4],[4,4]];
  if (type === 'L') return [[0,0,3],[3,3,3],[0,0,0]];
  if (type === 'J') return [[2,0,0],[2,2,2],[0,0,0]];
  if (type === 'I') return [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]];
  if (type === 'S') return [[0,5,5],[5,5,0],[0,0,0]];
  if (type === 'Z') return [[7,7,0],[0,7,7],[0,0,0]];
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.classList.add(colors[value]);
        cell.style.gridRowStart = y + offset.y + 1;
        cell.style.gridColumnStart = x + offset.x + 1;
        gameDiv.appendChild(cell);
      }
    });
  });
}

function draw() {
  gameDiv.innerHTML = '';
  drawMatrix(arena, {x:0, y:0});
  drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function playerDrop() {
  if (pauseGameState) return;
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'TJLOSZI';
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    isGameOver = true;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function updateScore() {
  document.getElementById("score").innerText = "Score: " + player.score;
}

function gameOver() {
  document.getElementById('game_status').innerText = "Game Over";
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let startTime = new Date().getTime();

function timer(duration, newTime) {
  const seconds = Math.floor(duration / 1000);
  document.getElementById("timer").innerText = "Time: " + seconds + "s";
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  let newTime = new Date().getTime();
  let duration = newTime - startTime;

  timer(duration, newTime);
  draw();
  !isGameOver ? requestAnimationFrame(update) : gameOver();
}

// controls
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
  else if (event.key === 'ArrowUp') playerRotate(1);
  else if (event.key === 'p' || event.key === 'P') pauseGameState = !pauseGameState;
  else if (event.key === 'r' || event.key === 'R') location.reload();
});

// start game
playerReset();
updateScore();
update();
