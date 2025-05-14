//getting the game canvas
const canvas = document.getElementById('game')
//const context = canvas.getContext('2d')

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