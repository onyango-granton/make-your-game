// Getting the game container
const gameContainer = document.getElementById('game_container')

// Create arena grid elements
const arenaWidth = 12
const arenaHeight = 20

let pauseGameState = false

// Initialize the arena as a 2D array
const arena = createMatrix(arenaWidth, arenaHeight)

// Create div grid for visual representation
function createGameBoard() {
  gameContainer.style.gridTemplateColumns = `repeat(${arenaWidth}, 1fr)`
  gameContainer.style.gridTemplateRows = `repeat(${arenaHeight}, 1fr)`
  gameContainer.style.position = 'relative'
  
  for (let y = 0; y < arenaHeight; y++) {
    for (let x = 0; x < arenaWidth; x++) {
      const cell = document.createElement('div')
      cell.className = 'cell'
      cell.dataset.x = x
      cell.dataset.y = y
      gameContainer.appendChild(cell)
    }
  }
}

function arenaSweep(){
  let rowCount = 1
  outer: for (let y = arena.length - 1; y > 0; --y){
    for (let x = 0; x < arena[y].length; ++x){
      if (arena[y][x] === 0) {
        continue outer
      }
    }
    const row = arena.splice(y, 1)[0].fill(0)
    arena.unshift(row)
    ++y

    player.score += rowCount * 10
    rowCount *= 2
  }
}

function collide(arena, player){
  const [m, o] = [player.matrix, player.pos]

  for(let y=0; y < m.length; ++y){
    for(let x = 0; x < m[y].length; ++x){
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0){
        return true
      }
    }
  }
  return false
}

function createMatrix(w, h){
  const matrix = []
  while (h--){
    matrix.push(new Array(w).fill(0))
  }
  return matrix
}

function createPiece(type) {
  if (type == 'I') {
    return [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
    ]
  } else if (type == 'J') {
    return [
    [2,0,0],
    [2,2,2],
    [0,0,0]
    ]
  } else if (type == 'L') {
    return [
    [0,0,3],
    [3,3,3],
    [0,0,0]
    ]
  } else if (type == 'O') {
    return [
    [4,4],
    [4,4]
    ]
  } else if (type == 'S') {
    return [
    [0,5,5],
    [5,5,0],
    [0,0,0]
    ]
  } else if (type == 'T') {
    return [
    [0,6,0],
    [6,6,6],
    [0,0,0]
    ]
  } else if (type == 'Z') {
    return [
    [7,7,0],
    [0,7,7],
    [0,0,0]
    ]
  } 
}

function playerMove(dir){
  player.pos.x += dir
  if (collide(arena, player)){
    player.pos.x -= dir
  }
}

let isGameOver = false

function playerReset(){
  const pieces = "IJLOTSZ"
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0])
  player.pos.y = 0
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
  
  if (collide(arena, player)){
    isGameOver = true
  }
}

function playerRotate(dir){
  const pos = player.pos.x
  let offset = 1
  rotate(player.matrix, dir)
  while (collide(arena, player)){
    player.pos.x +=  offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir)
      player.pos.x = pos
      return
    }
  }
}

function rotate(matrix, dir){
  for (let y = 0; y < matrix.length; ++y){
    for (let x = 0; x < y; ++x){
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]]
    }
  }

  if (dir > 0){
    matrix.forEach(row => row.reverse())
  } else {
    matrix.reverse()
  }
}

function getColorClass(value) {
  const colors = {
    1: 'piece-red',
    2: 'piece-orange', 
    3: 'piece-yellow',
    4: 'piece-green',
    5: 'piece-blue',
    6: 'piece-purple',
    7: 'piece-pink'
  }
  return colors[value] || ''
}

function draw(){
  // Clear all cells
  const cells = gameContainer.querySelectorAll('.cell')
  cells.forEach(cell => {
    cell.className = 'cell'
  })

  // Draw arena (placed pieces)
  drawMatrix(arena, {x:0, y:0})
  
  // Draw current player piece
  drawMatrix(player.matrix, player.pos)
}

function drawMatrix(matrix, offset){
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const cellX = x + offset.x
        const cellY = y + offset.y
        
        if (cellX >= 0 && cellX < arenaWidth && cellY >= 0 && cellY < arenaHeight) {
          const cell = gameContainer.querySelector(`[data-x="${cellX}"][data-y="${cellY}"]`)
          if (cell) {
            cell.classList.add(getColorClass(value))
          }
        }
      }
    })
  })
}

function merge(arena, player){
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0){
        arena[y+ player.pos.y][x+player.pos.x] = value
      }
    })
  })
}

function playerDrop(){
  if (!pauseGameState) {
    player.pos.y++
    if (collide(arena, player)){
      player.pos.y--
      merge(arena, player)
      playerReset()
      arenaSweep()
      updateScore()
    }
    dropCounter = 0
  }
}

let dropCounter = 0
let dropInterval = 1000
let lastTime = 0
let startTime = new Date().getTime()
let isWindowBlurred = false

function update(time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime
  if (dropCounter > dropInterval){
    playerDrop()
  }

  let newTime = new Date().getTime()
  let duration = newTime - startTime

  timer(duration, newTime)

  draw()
  !isGameOver ? requestAnimationFrame(update) : gameOver()
}

function updateScore() {
  document.getElementById("score").innerText = "Score: " + player.score
}

const player = {
  pos: {x : 0, y : 0},
  matrix: null,
  score: 0
}

document.addEventListener('keydown', function(e) {
  if (e.key === "ArrowLeft"){
    !pauseGameState ? playerMove(-1) : playerMove(0)
  } else if (e.key === "ArrowRight"){
    !pauseGameState ? playerMove(1) : playerMove(0)
  } else if (e.key === "ArrowDown"){
    !pauseGameState ? playerDrop() : null
  } else if (e.key === "ArrowUp"){
    !pauseGameState ? playerRotate(+1) : null
  } else if (e.key === "r"){
    window.location.reload()
  } else if (e.key === "p"){
    if (!pauseGameState) {
      pauseGameState = true
      pauseStartTime = new Date().getTime()
    } else {
      pauseGameState = false
      totalPauseTime += new Date().getTime() - pauseStartTime
      pauseStartTime = 0
    }
    gameStatus()
  }
  console.log(e.key)
})

function gameStatus(){
  if (!pauseGameState){
    document.getElementById("game_status").innerText = "Active"
    document.getElementById("game_status").style.color = "green"
  } else {
    document.getElementById("game_status").innerText = "Paused"
    document.getElementById("game_status").style.color = "red"
  }
}

let pauseStartTime = 0
let totalPauseTime = 0
let lastDuration = 0

window.addEventListener('blur', () => {
  if (pauseGameState){
    return
  }
  isWindowBlurred = true
  if (!pauseStartTime) {
    pauseStartTime = new Date().getTime()
  }
})

function gameOver(){
  let highscoreText = "Highscore: "+ player.score
  let totalTime = "Time Played: " + formatTime(lastDuration)
  
  // Create game over overlay
  const gameOverDiv = document.createElement('div')
  gameOverDiv.className = 'game-over'
  gameOverDiv.innerHTML = `
    <h2>Game Over</h2>
    <p>${highscoreText}</p>
    <p>${totalTime}</p>
    <p>To play again... press 'r'</p>
  `
  
  gameContainer.appendChild(gameOverDiv)
  
  document.getElementById("game_status").innerText = "GAMEOVER..."
  document.getElementById("game_status").style.color = "black"
}

function formatTime(seconds){
  return new Date(seconds * 1000).toISOString().slice(11, 19);
}

window.addEventListener('focus', () => {
  if (pauseGameState){
    return
  }
  if (isWindowBlurred && pauseStartTime) {
    totalPauseTime += new Date().getTime() - pauseStartTime
    pauseStartTime = 0
  }
  isWindowBlurred = false
})

function timer() {
  if (!pauseGameState && !isWindowBlurred) {
    const now = new Date().getTime()
    const elapsed = ((now - startTime - totalPauseTime) / 1000) | 0
    document.getElementById("timer").innerText = formatTime(elapsed)
    lastDuration = elapsed
  } else {
    document.getElementById("timer").innerText = formatTime(lastDuration)
  }
}

// Initialize the game
createGameBoard()
gameStatus()
updateScore()
playerReset()
update()