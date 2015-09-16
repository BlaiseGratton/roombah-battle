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
            if (distance <= roomba.radius + rba.radius && roomba.collidingWith.indexOf(rba.name) === -1) {
              roomba.collidingWith.push(rba.name);
              rba.collidingWith.push(roomba.name);
              roombas = collideRoombas(roomba, rba, roombas);
            }
            if (distance >= roomba.radius + rba.radius) {
              roomba.collidingWith.splice(roomba.collidingWith.indexOf(rba.name), 1);
              rba.collidingWith.splice(roomba.collidingWith.indexOf(roomba.name), 1);
            }
          });
        }
      }
    });
  }
  return roombas;
}

function separateRoombas(roomba1, roomba2) {
  console.log(roomba1.collidingWith);
  console.log(roomba2.collidingWith);
  roomba1.velocity *= .5;
  roomba2.velocity *= .5;
  roomba1 = calculateMovement([roomba1])[0];
  roomba2 = calculateMovement([roomba2])[0];
  if (calculateDistance(roomba1, roomba2) >= roomba1.distance + roomba2.distance) {
    var separatedRoombas = separateRoombas(roomba1, roomba2);
    roomba1 = separatedRoombas[0];
    roomba2 = separatedRoombas[1];
  }
  roomba1.velocity *= 2;
  roomba2.velocity *= 2;
  return [roomba1, roomba2];
}

function collideRoombas(roomba1, roomba2, roombas) {
  var idx1 = roombas.indexOf(roomba1);
  var idx2 = roombas.indexOf(roomba2);
  var dx = Math.abs(roomba1.x - roomba2.x);
  var dy = Math.abs(roomba1.y - roomba2.y);
  var angle = Math.atan(dy/dx)/Math.PI;
  roomba1.direction = bisectDirection(roomba1.direction, roomba1.y >= roomba2.y, roomba1.x >= roomba2.x, angle);
  roomba2.direction = bisectDirection(roomba2.direction, roomba2.y >= roomba1.y, roomba2.x >= roomba1.x, angle);
  var vel1 = roomba1.velocity;
  roomba1.velocity = roomba2.velocity;
  roomba2.velocity = vel1;
  var separatedRoombas = separateRoombas(roomba1, roomba2)
  roombas[idx1] = separatedRoombas[0];
  roombas[idx2] = separatedRoombas[1];
  return roombas;
}

function bisectDirection(direction, furtherDown, furtherRight, angle) {
  var reflectionAngle;
  var distFromBisectAngle;
  if (furtherDown) {
    if (furtherRight) {
      reflectionAngle = 1.5 + angle;
    }
    if (!furtherRight) {
      reflectionAngle = 1.5 - angle;
    }
  }
  if (!furtherDown) {
    if (furtherRight) {
      reflectionAngle = .5 - angle;
    }
    if (!furtherRight) {
      reflectionAngle = .5 + angle;
    }
  }
  distFromBisectAngle = reflectionAngle - direction;
  direction = reflectionAngle + distFromBisectAngle;
  if (direction > 2) { direction -= 2; }
  return direction;
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
    if (roomba.y >= 320 - roomba.radius) roomba.y = 299 - roomba.radius;
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
  roombaArray = calculateMovement(detectCollisions(roombaArray));
}, 20);

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
