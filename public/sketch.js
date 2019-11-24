function Bird(y, name, yours) {
	this.y = y;
	this.x = 64;
  this.name = name;
  this.yours = yours;

	this.show = function() {
    if(this.yours){
      fill(255, 0, 0);
    }else{
      textSize(16);
      fill(255, 0, 255);
      text(name, this.x, this.y - 30)
      fill(255);
    }
    ellipse(this.x, this.y, 32, 32);
  }
}

function Pipe(top, bottom, x) {
  this.top = top;
  this.bottom = bottom;
  this.x = x;
  this.w = 80;

  this.highlight = false;

  this.show = function() {
    fill(255);
    if (this.highlight) {
      fill(255, 0, 0);
    }
    rect(this.x, 0, this.w, this.top);
    rect(this.x, height-this.bottom, this.w, this.bottom);
  }
}

var birds = [];
var pipes = [];
var player_id
var socket;
var inGame = null;
var secondsToStart = -1;

function setup() {
  createCanvas(640, 480);

  socket = io.connect('http://localhost:3000');

  input = createInput();
  input.position(20, 65);

  button = createButton('Submit');
  button.position(input.x + input.width, 65);
  button.mousePressed(newPlayer);

  greeting = createElement('h2', 'What is your name?');
  greeting.position(20, 5);
}

function newPlayer(){
  var name = input.value();

  socket.emit('new player', name);

  socket.on('player id', function(id){
    player_id = id;
  });

  inGame = false;

  socket.on('state', function(gameState){
    update(gameState);
  });

  input.remove();
  greeting.remove();
  button.remove();
}

function update(gameState) {
  birds = [];
  pipes = [];
  inGame = gameState.playing;
  secondsToStart = gameState.secondsToStart;

  for (var i = gameState.pipes.length-1; i >= 0; i--) {
    var pipe = gameState.pipes[i];
    pipes.push(new Pipe(pipe.top, pipe.bottom, pipe.x));
  }

  for (var i = gameState.birds.length-1; i >= 0; i--) {
    var bird = gameState.birds[i];
    birds.push(new Bird(bird.y, bird.name, bird.id == player_id));
  }
}


function draw() {
  if(inGame != null){
    background(0);
    if(inGame){
      for (var i = pipes.length-1; i >= 0; i--) {
        pipes[i].show();
      }
      for (var i = birds.length-1; i >= 0; i--) {
        birds[i].show();
      }
    }else{
      textSize(32);
      fill(255, 255, 255);
      text('Seconds to Start: ' + str(secondsToStart.toFixed(2)), 10, 30);
    }
  }
}

function keyPressed() {
  if (key == ' ') {
  	socket.emit('up pressed');
  }
}