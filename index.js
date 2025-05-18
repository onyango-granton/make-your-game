// Game configuration
const CONFIG = {
    ARENA_WIDTH: 12,
    ARENA_HEIGHT: 20,
    TARGET_FPS: 60,
    FRAME_TIME: 1000 / 60, // ~16.67ms
    DROP_INTERVAL: 1000
};

// Performance monitoring
let frameCount = 0;
let fpsStartTime = performance.now();
let lastFpsUpdate = performance.now();

// Game container and state
const gameContainer = document.getElementById('game_container');
let pauseGameState = false;
let isGameOver = false;

// Pre-create cells array for better performance
let cells = [];
const arena = createMatrix(CONFIG.ARENA_WIDTH, CONFIG.ARENA_HEIGHT);

// Optimized game board creation
function createGameBoard() {
    const fragment = document.createDocumentFragment();
    
    gameContainer.style.gridTemplateColumns = `repeat(${CONFIG.ARENA_WIDTH}, 1fr)`;
    gameContainer.style.gridTemplateRows = `repeat(${CONFIG.ARENA_HEIGHT}, 1fr)`;
    gameContainer.style.position = 'relative';
    
    // Pre-create all cells
    cells = [];
    for (let y = 0; y < CONFIG.ARENA_HEIGHT; y++) {
        cells[y] = [];
        for (let x = 0; x < CONFIG.ARENA_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cells[y][x] = cell; // Store reference for fast access
            fragment.appendChild(cell);
        }
    }
    
    gameContainer.appendChild(fragment);
}

// Optimized arena sweep with batch operations
function arenaSweep() {
    let rowCount = 1;
    const rowsToRemove = [];
    
    // Find all complete rows
    for (let y = arena.length - 1; y > 0; --y) {
        let isComplete = true;
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                isComplete = false;
                break;
            }
        }
        if (isComplete) {
            rowsToRemove.push(y);
        }
    }
    
    // Remove complete rows and update score
    rowsToRemove.forEach(y => {
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        player.score += rowCount * 10;
        rowCount *= 2;
    });
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && 
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Optimized piece creation with pre-defined shapes
const PIECE_SHAPES = {
    'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    'J': [[2,0,0], [2,2,2], [0,0,0]],
    'L': [[0,0,3], [3,3,3], [0,0,0]],
    'O': [[4,4], [4,4]],
    'S': [[0,5,5], [5,5,0], [0,0,0]],
    'T': [[0,6,0], [6,6,6], [0,0,0]],
    'Z': [[7,7,0], [0,7,7], [0,0,0]]
};

function createPiece(type) {
    return PIECE_SHAPES[type] || PIECE_SHAPES['I'];
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = "IJLOTSZ";
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
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
    // Transpose
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    
    // Reverse rows or columns based on direction
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Optimized color mapping
const PIECE_COLORS = [
    '', 'piece-red', 'piece-orange', 'piece-yellow',
    'piece-green', 'piece-blue', 'piece-purple', 'piece-pink'
];

// Highly optimized drawing function
let lastArenaState = createMatrix(CONFIG.ARENA_WIDTH, CONFIG.ARENA_HEIGHT);
let arenaChanged = true;

function draw() {
    // Check if arena changed to avoid unnecessary updates
    if (arenaChanged) {
        drawMatrix(arena, { x: 0, y: 0 }, true);
        // Copy current arena state
        for (let y = 0; y < CONFIG.ARENA_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.ARENA_WIDTH; x++) {
                lastArenaState[y][x] = arena[y][x];
            }
        }
        arenaChanged = false;
    }
    
    // Always draw the current piece
    drawMatrix(player.matrix, player.pos, false);
}

function drawMatrix(matrix, offset, isArena) {
    const startY = Math.max(0, -offset.y);
    const endY = Math.min(matrix.length, CONFIG.ARENA_HEIGHT - offset.y);
    const startX = Math.max(0, -offset.x);
    
    for (let y = startY; y < endY; y++) {
        const row = matrix[y];
        const endX = Math.min(row.length, CONFIG.ARENA_WIDTH - offset.x);
        
        for (let x = startX; x < endX; x++) {
            const value = row[x];
            const cellY = y + offset.y;
            const cellX = x + offset.x;
            
            if (cellY >= 0 && cellY < CONFIG.ARENA_HEIGHT && 
                cellX >= 0 && cellX < CONFIG.ARENA_WIDTH) {
                const cell = cells[cellY][cellX];
                
                if (isArena) {
                    // For arena, set the base state
                    cell.className = value !== 0 ? `cell ${PIECE_COLORS[value]}` : 'cell';
                } else if (value !== 0) {
                    // For current piece, temporarily add color
                    cell.className = `cell ${PIECE_COLORS[value]}`;
                }
            }
        }
    }
    
    // Clear cells that were previously occupied by the current piece
    if (!isArena) {
        requestAnimationFrame(() => {
            drawMatrix(arena, { x: 0, y: 0 }, true);
        });
    }
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
    arenaChanged = true;
}

function playerDrop() {
    if (!pauseGameState) {
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
}

// Game timing and loop optimization
let dropCounter = 0;
let lastTime = 0;
let startTime = performance.now();
let isWindowBlurred = false;

// FPS monitoring
function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= lastFpsUpdate + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
        document.getElementById('fps-counter').textContent = `FPS: ${fps}`;
        frameCount = 0;
        lastFpsUpdate = currentTime;
    }
}

// Optimized game loop with consistent timing
function update(currentTime = performance.now()) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Update FPS counter
    updateFPS();
    
    // Game logic updates
    dropCounter += deltaTime;
    if (dropCounter > CONFIG.DROP_INTERVAL) {
        playerDrop();
    }
    
    // Timer update (less frequent)
    if (frameCount % 30 === 0) { // Update every 30 frames (~500ms)
        timer();
    }
    
    // Render
    draw();
    
    // Continue game loop
    if (!isGameOver) {
        requestAnimationFrame(update);
    } else {
        gameOver();
    }
}

function updateScore() {
    document.getElementById("score").textContent = "Score: " + player.score;
}

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0
};

// Optimized event handling with debouncing
let keyStates = {};

document.addEventListener('keydown', function(e) {
  if (e.key === "ArrowLeft"){
    !pauseGameState ? playerMove(-1) : playerMove(0)
  } else if (e.key === "ArrowRight"){
    !pauseGameState ? playerMove(1) : playerMove(0)
  } else if (e.key === "ArrowDown"){
    !pauseGameState ? playerDrop() : null
  } else if (e.key === "ArrowUp"){
    // console.log("space")
    !pauseGameState ? playerRotate(+1) : null
  } else if (e.key === "r"){
    window.location.reload()
  } else if (e.key === "p"){
    togglePause();
  }
  console.log(e.key)
})

document.addEventListener('keyup', function(e) {
    keyStates[e.key] = false;
});

function togglePause() {
    if (!pauseGameState) {
        pauseGameState = true;
        pauseStartTime = performance.now();
    } else {
        pauseGameState = false;
        totalPauseTime += performance.now() - pauseStartTime;
        pauseStartTime = 0;
    }
    gameStatus();
}

// Updated restartGame function to clear pause overlay
function restartGame() {
    // Remove pause overlay if it exists
    if (pauseOverlay) {
        gameContainer.removeChild(pauseOverlay);
        pauseOverlay = null;
    }
    
    // Reset all game state
    arena.forEach(row => row.fill(0));
    player.score = 0;
    isGameOver = false;
    pauseGameState = false;
    dropCounter = 0;
    startTime = performance.now();
    totalPauseTime = 0;
    pauseStartTime = 0;
    arenaChanged = true;
    
    // Clear game container and recreate
    gameContainer.innerHTML = '';
    createGameBoard();
    
    // Restart game
    gameStatus();
    updateScore();
    playerReset();
    requestAnimationFrame(update);
}

function gameStatus() {
    const statusElement = document.getElementById("game_status");
    if (!pauseGameState) {
        statusElement.textContent = "Active";
        statusElement.style.color = "green";
    } else {
        statusElement.textContent = "Paused";
        statusElement.style.color = "red";
    }
}

// Window focus/blur optimization
let pauseStartTime = 0;
let totalPauseTime = 0;
let lastDuration = 0;

window.addEventListener('blur', () => {
    if (pauseGameState) return;
    isWindowBlurred = true;
    if (!pauseStartTime) {
        pauseStartTime = performance.now();
    }
});

window.addEventListener('focus', () => {
    if (pauseGameState) return;
    if (isWindowBlurred && pauseStartTime) {
        totalPauseTime += performance.now() - pauseStartTime;
        pauseStartTime = 0;
    }
    isWindowBlurred = false;
});

// Updated gameOver function to handle pause overlay
function gameOver() {
    // Remove pause overlay if it exists
    if (pauseOverlay) {
        gameContainer.removeChild(pauseOverlay);
        pauseOverlay = null;
    }
    
    const highscoreText = "Highscore: " + player.score;
    const totalTime = "Time Played: " + formatTime(lastDuration);
    
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <h2>Game Over</h2>
        <p>${highscoreText}</p>
        <p>${totalTime}</p>
        <p>To play again... press 'r'</p>
    `;
    
    gameContainer.appendChild(gameOverDiv);
    
    document.getElementById("game_status").textContent = "GAME OVER";
    document.getElementById("game_status").style.color = "#ff4444";
}

//track the pause overlay
let pauseOverlay = null;

// Updated pauseGame function
function pauseGame() {
    if (pauseOverlay) return; // Prevents multiple overlays
    
    const highscoreText = "Current Score: " + player.score;
    const totalTime = "Time Played: " + formatTime(lastDuration);
    
    pauseOverlay = document.createElement('div');
    pauseOverlay.className = 'game-over'; // Reuse the same styling
    pauseOverlay.innerHTML = `
        <h2>Game Paused</h2>
        <p>${highscoreText}</p>
        <p>${totalTime}</p>
        <p>To continue... press 'p'</p>
        <p>To restart... press 'r'</p>
    `;
    
    gameContainer.appendChild(pauseOverlay);
}

// Updated unpauseGame function
function unpauseGame() {
    if (pauseOverlay) {
        gameContainer.removeChild(pauseOverlay);
        pauseOverlay = null;
    }
}

// Updated togglePause function
function togglePause() {
    if (!pauseGameState) {
        pauseGameState = true;
        pauseStartTime = performance.now();
        pauseGame(); // Show pause overlay
    } else {
        pauseGameState = false;
        totalPauseTime += performance.now() - pauseStartTime;
        pauseStartTime = 0;
        unpauseGame(); // Remove pause overlay
    }
    gameStatus();
}

function formatTime(seconds) {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
}

function timer() {
    if (!pauseGameState && !isWindowBlurred) {
        const now = performance.now();
        const elapsed = ((now - startTime - totalPauseTime) / 1000) | 0;
        document.getElementById("timer").textContent = formatTime(elapsed);
        lastDuration = elapsed;
    } else {
        document.getElementById("timer").textContent = formatTime(lastDuration);
    }
}

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

gameContainer.addEventListener('touchstart', function(e) {
    e.preventDefault();
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: false });

gameContainer.addEventListener('touchend', function(e) {
    e.preventDefault();
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleTouch();
}, { passive: false });

function handleTouch() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const threshold = 50;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                !pauseGameState && playerMove(1); // Right
            } else {
                !pauseGameState && playerMove(-1); // Left
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(diffY) > threshold) {
            if (diffY > 0) {
                !pauseGameState && playerDrop(); // Down
            } else {
                !pauseGameState && playerRotate(1); // Up (rotate)
            }
        }
    }
}

// Initialize game
createGameBoard();
gameStatus();
updateScore();
playerReset();
requestAnimationFrame(update);