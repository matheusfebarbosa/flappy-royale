function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var height = 480;
var width = 640;

class Bird{
  constructor() {
    this.y = random(2/5 * height, 3/5 * height);
    this.x = 64;

    this.gravity = 0.7;
    this.lift = -12;
    this.velocity = 0;
  }

  up() {
    this.velocity += this.lift;
  }

  update() {
    this.velocity += this.gravity;
    // this.velocity *= 0.9;
    this.y += this.velocity;

    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    }

    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }

  }
}

class Pipe{
  constructor() {
    this.spacing = 175;
    this.top = random(height / 6, 3 / 4 * height);
    this.bottom = height - (this.top + this.spacing);
    this.x = width;
    this.w = 80;
    this.speed = 5;
    this.highlight = false;
  }

  hits(bird) {
    if (bird.y < this.top || bird.y > height - this.bottom) {
      if (bird.x > this.x && bird.x < this.x + this.w) {
        this.highlight = true;
        return true;
      }
    }
    this.highlight = false;
    return false;
  }

  update() {
    this.x -= this.speed;
  }

  offscreen() {
    if (this.x < -this.w) {
      return true;
    } else {
      return false;
    }
  }
}

// Setup gamestate
const gameState = {
  players: {},
  pipes: [],
  inGame: false
}
var lastPlayerId = 0;
var inGameFrameCount = 0;
var menuFrameCount = 0;
var timeBetweenGames = 5;

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(3000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://'
   + host + ':' + port);
}

app.use(express.static('public'));


// Setup socket
var io = require('socket.io')(server);

io.on('connection', function(socket){
  console.log('A user connected: ', socket.id);

  socket.on('new player', function(name){
    console.log('New player!');
  	gameState.players[socket.id] = {
      id: lastPlayerId,
      name: name,
      playing: false,
      bird: null
    };
    lastPlayerId++;
    socket.emit('player id',  
      gameState.players[socket.id].id); 
  });

  socket.on('up pressed', function(){
    if (gameState.players[socket.id].playing){
      console.log("Player", socket.id, 
        "pressed up.")
    	gameState.players[socket.id].bird.up();
    }
  });

  socket.on('disconnect', function(){
    console.log('A user disconnected: ', socket.id);
    if (gameState.players[socket.id] != null){
    	delete gameState.players[socket.id];
    }
  });
});

// Update Logic
setInterval(() => {
  emitableGameState = {
    birds: [],
    pipes: [],
    secondsToStart: 0,
    playing: false
  }

  someonePlaying = false;

  if (gameState.inGame) {
    for(let key in gameState.players){
      if (gameState.players[key].playing){
        var bird = gameState.players[key].bird;
        bird.update();
        gameState.players[key].bird = bird;

        someonePlaying = true;

        for (var i = gameState.pipes.length-1; i >= 0; i--) {
          if (gameState.pipes[i].hits(bird)) {
            gameState.players[key].playing = false;
            gameState.players[key].bird = null;
          }
        }
      }
    }

    for (var i = gameState.pipes.length-1; i >= 0; i--) {
      gameState.pipes[i].update();
    }

    for (var i = gameState.pipes.length-1; i >= 0; i--) {
      if (gameState.pipes[i].offscreen()) {
        gameState.pipes.splice(i, 1);
      }
    } 

    if (inGameFrameCount % 75 == 0) {
      gameState.pipes.push(new Pipe());
    } 

    inGameFrameCount += 1;

    if (!someonePlaying){
      gameState.inGame = false;
      inGameFrameCount = 0;
      menuFrameCount = 0;
    }
  } else {
    menuFrameCount += 1;
    if(menuFrameCount / 60 == timeBetweenGames){
      gameState.inGame = true;

      for(let key in gameState.players){
        gameState.players[key].playing = true;
        gameState.players[key].bird = new Bird();
      }

      gameState.pipes = []
      inGameFrameCount = 0;
      menuFrameCount = 0;
    }
  }

  if(gameState.inGame){
    for(let key in gameState.players){
      if (gameState.players[key].playing){
        emitableGameState.birds.push({
          y: gameState.players[key].bird.y,
          name: gameState.players[key].name,
          id: gameState.players[key].id
        });
      }
    }  

    for (var i = gameState.pipes.length-1; i >= 0; i--) {
      emitableGameState.pipes.push({
        top: gameState.pipes[i].top,
        bottom: gameState.pipes[i].bottom,
        x: gameState.pipes[i].x,
      });
    }

    emitableGameState.playing = true;
  } else {
    emitableGameState.playing = false;
    emitableGameState.secondsToStart = timeBetweenGames - (menuFrameCount/60);
  }

  io.sockets.emit('state', emitableGameState);
}, 1000 / 60);