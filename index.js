//getting the game canvas
const canvas = document.getElementById('game_canvas')
const context = canvas.getContext('2d')

// defining tetrominoes
const tetrominoes = {
  'I': [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  'J': [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  'L': [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  'O': [
    [1,1],
    [1,1],
  ],
  'S': [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  'T': [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ],
  'Z': [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  
};


// tetromino color
const piece_color = {
  'I': 'red',
  'J': 'orange',
  'L': 'yellow',
  'O': 'green',
  'S': 'blue',
  'T': 'indigo',
  'Z': 'violet'
};

//order of sequence how tetrominoes will appear
const game_tetromino_sequence = []

//restarting and pausing game functions
document.addEventListener('keydown', function(e){
    if (e.key === "r"){
        console.log("Refresh key pressed")
        
        //implemented restart function; reload page
        this.location.reload()
    }

    if (e.key === 'p'){
        console.log("Pause key pressed")
        //todo implement pause
    }
})


//get randomInt to be used in populate_tetromino_sequence
function getRandomInt(stop) {
  return Math.floor(Math.random() * stop);
}

//populate game_tetromino_sequence
function populate_tetromino_sequence() {
    const tetros = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    while (true) {
        const rand = getRandomInt(tetros.length)
        game_tetromino_sequence.push(tetros[rand])
    }
}