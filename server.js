var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 
    'X-Requested-With,content-type,Authorization');
  next();
});

app.use(express.static(__dirname + '/public'));

function calculateDistance(roomba1, roomba2) {
  var distance = Math.sqrt(
      Math.pow(roomba1.y - roomba2.y, 2) + 
      Math.pow(roomba1.x - roomba2.x, 2));
  return distance;
}

var counter = 0;

function detectCollisions(roombas) {
  if (roombas) {
    roombas.forEach(function(roomba) {
      if (roomba !== null) {
        var otherRoombas = roombas.filter(function(rba) {
          if (rba !== null)
            return rba.name !== roomba.name;
        });
        if (otherRoombas) {
          otherRoombas.forEach(function(rba) {
            var distance = calculateDistance(roomba, rba);
            if (distance <= roomba.radius + rba.radius && roomba.collisions.indexOf(rba.name) === -1) {
              console.log(rba.name + " " + counter);
              counter++;
              roombas = collideRoombas(roomba, rba, roombas);
            }
          });
        }
      }
    });
    roombas.forEach(function(roomba) {
      if (!!roomba)
        roomba.collisions = [];
    });
  }
  return roombas;
}

function collideRoombas(roomba1, roomba2, roombas) {
  var idx1 = roombas.indexOf(roomba1);
  var idx2 = roombas.indexOf(roomba2);
  var dx = Math.abs(roomba1.x - roomba2.x);
  var dy = Math.abs(roomba1.y - roomba2.y);
  var angle = Math.atan(dy/dx);
  if (roomba2.y >= roomba1.y) {
    roomba2.direction = 1 + angle;
    roomba1.direction = angle;
  }
  if (roomba2.y < roomba1.y) {
    roomba2.direction = 1 - angle;
    roomba1.direction = 2 - angle;
  }
  roomba1.collisions.push(roomba2.name);
  roomba2.collisions.push(roomba1.name);
  var vel1 = roomba1.velocity;
  roomba1.velocity = roomba2.velocity;
  roomba2.velocity = vel1;
  roombas[idx1] = roomba1;
  roombas[idx2] = roomba2;
  return roombas;
}

function calculateMovement(roombas) {
  if (roombas) {
    roombas.forEach(function(roomba) {
      var dx;
      var dy;
      dx = (roomba.velocity)*(Math.cos(roomba.direction * Math.PI));
      dy = (roomba.velocity)*(Math.sin(roomba.direction * Math.PI));
      roomba.x += dx;
      roomba.y += dy;
      roomba = checkArenaBounds(roomba);
    });
  }
  return roombas;
};

function bounceOffTopOrBottom(roomba) {
  if (roomba.direction === 0) {
  }
  if (roomba.direction === 1) {
  }
  roomba.direction = 2 - roomba.direction;
  return roomba;
};

function bounceOffSides(roomba) {
  if (roomba.direction > 1) {
    roomba.direction = 2 - (roomba.direction - 1);
  }
  if (roomba.direction <= 1) {
    roomba.direction = 1 - roomba.direction;
  }
  return roomba;
};

function checkArenaBounds(roomba) {
  if (roomba.y <= roomba.radius || roomba.y >= 300 - roomba.radius) {
    bounceOffTopOrBottom(roomba);
    if (roomba.y <= 0) roomba.y = roomba.radius + 1;
    if (roomba.y >= 320 - roomba.radius) roomba.y = 300 - roomba.radius;
  }
  if (roomba.x <= roomba.radius || roomba.x >= 320 - roomba.radius) {
    if (roomba.x <= roomba.radius) roomba.x = roomba.radius + 1;
    if (roomba.x >= 320 - roomba.radius) roomba.x = 319 - roomba.radius;
    bounceOffSides(roomba);
  }
  return roomba;
};

var roombas = {};
var roombaArray = [];

setInterval(function() {
  roombaArray = detectCollisions(roombaArray);
  roombaArray = calculateMovement(roombaArray);
}, 25);

io.on('connection', function(socket) {
  var roombaIndex;
  var addedRoomba = false;
  socket.on('join game', function(roomba) {
    socket.username = roomba.name;
    roombaArray.push(roomba);
    roombaIndex = roombaArray.indexOf(roomba);
    addedRoomba = true;
  });

  socket.on('requestRoombas', function() {
    socket.emit('roombas', roombaArray);
  });

  socket.on('roomba left', function(index) {
    console.log('user left');
    console.log(index);
  });

  socket.on('disconnect', function() {
    io.sockets.sockets.map(function(e) {
      return e.username;
    });

    if (addedRoomba) {
      console.log(socket.username + ' disconnected');

      delete roombas[socket.username];
      roombaArray[roombaIndex] = null;
      socket.broadcast.emit('roomba left', roombaIndex);
    }
  });
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
