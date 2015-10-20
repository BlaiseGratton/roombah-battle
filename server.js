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

function calculateCollisionVector(roomba, collisionAngle, velocity) {
  var vectors = { 'independentVector': '', 'collidingVector': '' };
  var φ = collisionAngle - roomba.direction;
  if (φ > 2) φ -= 2;
  if (φ < 0) φ += 2;
  φ *= Math.PI;
  vectors.collidingVector = (Math.cos(φ)/velocity);
  vectors.independentVector = (Math.tan(φ)*vectors.collidingVector);
  return vectors;
}

function collideVectors(vector1, vector2){
  return vector2; // this is assuming equal masses!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

function convertVectorsToSpeed(vectors) {
  return Math.sqrt(Math.pow(vectors.independentVector, 2) + Math.pow(vectors.collidingVector, 2));
}

function calculateDirection(roomba, vectors, collisionAngle) {
  roomba.direction += (
    Math.tan(vectors.independentVector/vectors.collidingVector) + collisionAngle
  );
  return roomba.direction;
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

function collideRoombas(roomba1, roomba2, roombas) {
  var idx1 = roombas.indexOf(roomba1);
  var idx2 = roombas.indexOf(roomba2);
  var dx = Math.abs(roomba1.x - roomba2.x);
  var dy = Math.abs(roomba1.y - roomba2.y);
  var collisionAngle = Math.atan(dy/dx)/Math.PI;
  var r1v1 = Math.sqrt(Math.pow(roomba1.xVelocity, 2) + Math.pow(roomba1.yVelocity, 2));
  var r2v1 = Math.sqrt(Math.pow(roomba2.xVelocity, 2) + Math.pow(roomba2.yVelocity, 2));
  var rba1Vectors = calculateCollisionVector(roomba1, collisionAngle, r1v1);
  var rba2Vectors = calculateCollisionVector(roomba2, collisionAngle, r2v1);
  var rba1CollidingVector = rba1Vectors.collidingVector;
  var rba2CollidingVector = rba2Vectors.collidingVector;
  rba1Vectors.collidingVector = collideVectors(rba1CollidingVector, rba2CollidingVector);
  rba2Vectors.collidingVector = collideVectors(rba2CollidingVector, rba1CollidingVector);
  roomba1.speed = convertVectorsToSpeed(rba1Vectors);
  roomba2.speed = convertVectorsToSpeed(rba2Vectors);
  roomba1.direction = calculateDirection(roomba1, rba1Vectors, collisionAngle);
  roomba2.direction = calculateDirection(roomba2, rba2Vectors, collisionAngle);
  roomba1 = convertDirectionToXYVectors(roomba1);
  roomba2 = convertDirectionToXYVectors(roomba2);
  roombas[idx1] = roomba1;
  roombas[idx2] = roomba2;
  return roombas;

  /*
  var dx = Math.abs(roomba1.x - roomba2.x);
  var dy = Math.abs(roomba1.y - roomba2.y);
  var angle = Math.atan(dy/dx)/Math.PI;
  var overtaking = Math.abs(roomba1.direction - roomba2.direction) < .5 || 
      Math.abs(roomba1.direction - roomba2.direction) > 1.5;
  roomba1.direction = bisectDirection(roomba1.direction, roomba2.direction, roomba1.y >= roomba2.y, 
      roomba1.x >= roomba2.x, angle, overtaking);
  roomba2.direction = bisectDirection(roomba2.direction, roomba1.direction, roomba2.y >= roomba1.y, 
      roomba2.x >= roomba1.x, angle, overtaking);
  var vel1 = roomba1.velocity;
  roomba1.velocity = roomba2.velocity;
  roomba2.velocity = vel1;
  var separatedRoombas = separateRoombas(roomba1, roomba2)
  roombas[idx1] = separatedRoombas[0];
  roombas[idx2] = separatedRoombas[1];
  */
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
