//getting the game canvas
const canvas = document.getElementById('game_canvas')
const context = canvas.getContext('2d')

context.scale(20,20)

context.fillStyle = "#000"
context.fillRect(0,0, canvas.clientWidth, canvas.clientHeight)

const matrix = [
  [0,0,0],
  [1,1,1],
  [0,1,0]
]

function drawMatrix(matrix, offset){
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value != 0){
        context.fillStyle = 'red'
        context.fillRect(x + offset.x,y + offset.y,1,1)
      }
    })
  })
}


drawMatrix(matrix, {x : 5, y : 5})