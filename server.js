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
  roomba1 = calculateMovement([roomba1])[0];
  roomba2 = calculateMovement([roomba2])[0];
  if (calculateDistance(roomba1, roomba2) >= roomba1.distance + roomba2.distance) {
    var separatedRoombas = separateRoombas(roomba1, roomba2);
    roomba1 = separatedRoombas[0];
    roomba2 = separatedRoombas[1];
  }
  return [roomba1, roomba2];
}

function calculateCollisionVectors(roomba, velocity) {
  var vectors = { 'independentVector': '', 'collidingVector': '' };
  var φ = Math.abs(roomba.collidingAngle - roomba.direction);
  φ *= Math.PI;
  vectors.collidingVector = (Math.cos(φ)*velocity);
  vectors.independentVector = (Math.tan(φ)*vectors.collidingVector);
  return vectors;
}

function collideVectors(vector1, vector2){
  return vector2; // this is assuming equal masses!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

function convertVectorsToSpeed(vectors) {
  return Math.sqrt(Math.pow(vectors.independentVector, 2) + Math.pow(vectors.collidingVector, 2));
}

function calculateDirection(roomba, vectors) {
  var direction = roomba.collidingAngle - 1 + (
    Math.atan(vectors.independentVector/vectors.collidingVector)/Math.PI
  );
  roomba.collidingAngle = 0;
  if (direction > 2)
    direction -= 2;
  if (direction < 0)
    direction += 2;
  return direction;
}

function convertDirectionToXYVectors(roomba) {
  var direction;
  var xVelocity;
  var yVelocity;
  if (roomba.direction > 1) {
    direction = roomba.direction - 1;
  } else { direction = roomba.direction; };
  xVelocity = Math.cos(direction*Math.PI)/roomba.speed;
  yVelocity = Math.sin(direction*Math.PI)/roomba.speed;
  if (roomba.direction > .5 && roomba.direction < 1.5) {
    xVelocity *= -1;
  }
  if (roomba.direction > 1) yVelocity *= -1;
  roomba.xVelocity = xVelocity;
  roomba.yVelocity = yVelocity;
  return roomba;
}

function setCollidingAngle(roomba, otherRoomba, collisionAngle) {
  var quadrant;
  if (roomba.y < otherRoomba.y) {
    if (roomba.x < otherRoomba.x) 
      quadrant = .5;
    if (roomba.x > otherRoomba.x)
      quadrant = 1;
  }
  if (roomba.y > otherRoomba.y) {
    if (roomba.x > otherRoomba.x)
      quadrant = 1.5;
    if (roomba.x < otherRoomba.x)
      quadrant = 2;
  }
  return quadrant - collisionAngle;
}

function collideRoombas(roomba1, roomba2, roombas) {
  var idx1 = roombas.indexOf(roomba1);
  var idx2 = roombas.indexOf(roomba2);
  var dx = Math.abs(roomba1.x - roomba2.x);
  var dy = Math.abs(roomba1.y - roomba2.y);
  var collisionAngle = Math.atan(dy/dx)/Math.PI;
  roomba1.collidingAngle = setCollidingAngle(roomba1, roomba2, collisionAngle);
  roomba2.collidingAngle = setCollidingAngle(roomba2, roomba1, collisionAngle);
  var r1v1 = Math.sqrt(Math.pow(roomba1.xVelocity, 2) + Math.pow(roomba1.yVelocity, 2));
  var r2v1 = Math.sqrt(Math.pow(roomba2.xVelocity, 2) + Math.pow(roomba2.yVelocity, 2));
  var rba1Vectors = calculateCollisionVectors(roomba1, r1v1);
  var rba2Vectors = calculateCollisionVectors(roomba2, r2v1);
  var rba1CollidingVector = rba1Vectors.collidingVector;
  var rba2CollidingVector = rba2Vectors.collidingVector;
  rba1Vectors.collidingVector = collideVectors(rba1CollidingVector, rba2CollidingVector);
  rba2Vectors.collidingVector = collideVectors(rba2CollidingVector, rba1CollidingVector);
  roomba1.speed = convertVectorsToSpeed(rba1Vectors);
  roomba2.speed = convertVectorsToSpeed(rba2Vectors);
  roomba1.direction = calculateDirection(roomba1, rba1Vectors);
  roomba2.direction = calculateDirection(roomba2, rba2Vectors);
  roomba1 = convertDirectionToXYVectors(roomba1);
  roomba2 = convertDirectionToXYVectors(roomba2);
  var separatedRoombas = separateRoombas(roomba1, roomba2);
  roombas[idx1] = separatedRoombas[0];
  roombas[idx2] = separatedRoombas[1];
  return roombas;
}

function setRoombaDirection(roomba) {
  var xVelocity = roomba.xVelocity;
  var yVelocity = roomba.yVelocity;
  var angle = Math.atan(xVelocity, yVelocity)/Math.PI;
  if (xVelocity < 0) {
    if (yVelocity < 0) {
      angle += 1.5;
    }
  }
  if (xVelocity > 0) {
    if (yVelocity < 0)
      angle += 1;
    if (yVelocity > 0) 
      angle += .5;
  }
  roomba.direction = angle;
  return roomba;
}

function calculateMovement(roombas) {
  if (roombas) {
    roombas.forEach(function(roomba) {
      if (roomba) {
        roomba.x += roomba.xVelocity;
        roomba.y += roomba.yVelocity;
        roomba = checkArenaBounds(roomba);
      }
    });
  }
  return roombas;
};

function bounceOffTopOrBottom(roomba) {
  roomba.yVelocity *= -1;
  roomba = setRoombaDirection(roomba);
  return roomba;
};

function bounceOffSides(roomba) {
  roomba.xVelocity *= -1;
  roomba = setRoombaDirection(roomba);
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
  /*

  socket.on('roomba left', function(index) {
    console.log('user left');
    console.log(index);
  });

  socket.on('disconnect', function() {
    if (addedRoomba) {
      console.log(socket.username + ' disconnected');

      roombaArray[roombaIndex] = null;
      //socket.broadcast.emit('roomba left', roombaIndex);
    }
  });
  */
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
