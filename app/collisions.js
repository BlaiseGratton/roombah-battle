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

function calculateCollisionVectors(rba) {
  var quadrant = Math.PI/2;
  var vectors = { 'independentVector': '', 'collidingVector': '' };
  var φ = Math.abs(rba.collidingAngle - rba.direction);
  var difference = φ;
  if (φ > 3*quadrant)
    φ -= 3*quadrant;
  else if (φ > 2*quadrant)
    φ -= 2*quadrant;
  else if (φ > quadrant)
    φ -= quadrant;
  if (difference < quadrant || (difference > 2*quadrant && difference < 3*quadrant)) {
    vectors.collidingVector = (Math.cos(φ)*rba.speed);
    vectors.independentVector = (Math.sin(φ)*vectors.collidingVector);
  } else {
    vectors.collidingVector = (Math.sin(φ)*rba.speed);
    vectors.independentVector = (Math.cos(φ)*vectors.collidingVector);
  }
  //if (Math.abs(rba.direction - rba.collidingAngle) > (Math.PI/2))
  //  vectors.collidingVector *= (-1);
  if (rba.collidingAngle > rba.direction) 
    vectors.independentDirection = rba.collidingAngle - (Math.PI/2);
  if (rba.collidingAngle < rba.direction)
    vectors.independentDirection = rba.collidingAngle + (Math.PI/2);
  if (vectors.independentDirection < 0) 
    vectors.independentDirection += (2*Math.PI);
  if (vectors.independentDirection > 0)
    vectors.independentDirection -= (2*Math.PI);
  return vectors;
}

function collideVectors(vector1, vector2){
  return vector2; // this is assuming equal masses!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

function convertVectorsToSpeed(vectors) {
  return Math.sqrt(Math.pow(vectors.independentVector, 2) + Math.pow(vectors.collidingVector, 2));
}

function calculateDirectionAndSpeed(roomba, vectors) {
  var direction = roomba.direction;
  if (vectors.collidingVector < 0)
    roomba.collidingAngle -= Math.PI;
  if (roomba.collidingAngle < 0)
    roomba.collidingAngle += (Math.PI*2);
  var speed = Math.sqrt(Math.pow(vectors.independentVector, 2) + Math.pow(vectors.collidingVector, 2));
  var angle = Math.atan(vectors.independentVector/vectors.collidingVector);
  if (roomba.collidingAngle < roomba.direction)
    direction -= angle;
  if (roomba.collidingAngle > roomba.direction)
    direction += angle;
  direction += Math.PI;
  if (direction > (2*Math.PI))
    direction -= (2*Math.PI);
  if (direction < 0)
    direction += (2*Math.PI);
  roomba.direction = direction;
  return roomba;
}

function calculateXAndYVelocities(direction, speed) {
    var theta;
    var quadrant = (2*Math.PI)/4;
    if (direction < quadrant)
      theta = direction;
    else if (direction < (2*quadrant))
      theta = direction - quadrant;
    else if (direction < (3*quadrant))
      theta = direction - (2*quadrant);
    else if (direction < (4*quadrant))
      theta = direction - (3*quadrant);
    vm.roomba.xVelocity = speed * (Math.sin(theta));
    vm.roomba.yVelocity = speed * (Math.cos(theta));
    if (direction > quadrant && direction < (3*quadrant))
      vm.roomba.yVelocity *= (-1);
    if (direction > (2*quadrant))
      vm.roomba.xVelocity *= (-1);
  }

function convertDirectionToXYVectors(roomba) {
  var quadrant = Math.PI/2;
  var theta;
  if (roomba.direction < quadrant) {
    theta = roomba.direction;
    roomba.xVelocity = Math.sin(theta) * roomba.speed;
    roomba.yVelocity = Math.cos(theta) * roomba.speed;
  } else if (roomba.direction < 2*quadrant) {
    theta = roomba.direction  - quadrant;
    roomba.yVelocity = Math.sin(theta) * roomba.speed;
    roomba.xVelocity = Math.cos(theta) * roomba.speed;
  } else if (roomba.direction < 3*quadrant) {
    theta = roomba.direction - 2*quadrant;
    roomba.xVelocity = Math.sin(theta) * roomba.speed;
    roomba.yVelocity = Math.cos(theta) * roomba.speed;
  } else if (roomba.direction < 4*quadrant) {
    theta = roomba.direction - 4*quadrant;
    roomba.yVelocity = Math.sin(theta) * roomba.speed;
    roomba.xVelocity = Math.cos(theta) * roomba.speed;
  }
  if (roomba.direction > (2*quadrant))
    roomba.xVelocity *= (-1);
  if (roomba.direction > quadrant && roomba.direction < (3*quadrant))
    roomba.yVelocity *= (-1);
  return roomba;
}

function setCollidingAngle(roomba, otherRoomba) {
  var dx = roomba.x - otherRoomba.x;
  var dy = roomba.y - otherRoomba.y;
  var quadrant = Math.PI/2;
  var angle = Math.abs(Math.atan(dy/dx));
  var collidingAngle;
  if (roomba.y < otherRoomba.y) {
    if (roomba.x < otherRoomba.x) 
      collidingAngle = quadrant - angle;
    if (roomba.x > otherRoomba.x)
      collidingAngle = (3*quadrant) + angle;
  }
  if (roomba.y > otherRoomba.y) {
    if (roomba.x > otherRoomba.x)
      collidingAngle = (3*quadrant) - angle;
    if (roomba.x < otherRoomba.x)
      collidingAngle = quadrant + angle;
  }
  roomba.collidingAngle = collidingAngle;
  return roomba;
}

function collideRoombas(roomba1, roomba2, roombas) {
  var idx1 = roombas.indexOf(roomba1);
  var idx2 = roombas.indexOf(roomba2);
  roomba1 = setCollidingAngle(roomba1, roomba2);
  roomba2 = setCollidingAngle(roomba2, roomba1);
  var rba1Vectors = calculateCollisionVectors(roomba1);
  var rba2Vectors = calculateCollisionVectors(roomba2);
  var rba1CollidingVector = rba1Vectors.collidingVector;
  var rba2CollidingVector = rba2Vectors.collidingVector;
  rba1Vectors.collidingVector = collideVectors(rba1CollidingVector, rba2CollidingVector);
  rba2Vectors.collidingVector = collideVectors(rba2CollidingVector, rba1CollidingVector);
  roomba1 = calculateDirectionAndSpeed(roomba1, rba1Vectors);
  roomba2 = calculateDirectionAndSpeed(roomba2, rba2Vectors);
  roomba1 = convertDirectionToXYVectors(roomba1);
  roomba2 = convertDirectionToXYVectors(roomba2);
  var separatedRoombas = separateRoombas(roomba1, roomba2);
  roombas[idx1] = separatedRoombas[0];
  roombas[idx2] = separatedRoombas[1];
  return roombas;
}

function calculateDirectionAndSpeedFromXYVectors(roomba) {
  var quarter = ((2*Math.PI)/4);
  roomba.speed = Math.sqrt(Math.pow(roomba.xVelocity, 2) + Math.pow(roomba.yVelocity, 2));
  var theta = Math.abs(Math.atan(roomba.xVelocity/roomba.yVelocity));
  if (roomba.xVelocity >= 0 && roomba.yVelocity >= 0)
    roomba.direction = theta;
  else if (roomba.xVelocity >= 0 && roomba.yVelocity < 0)
    roomba.direction = (2*quarter) - theta;
  else if (roomba.xVelocity < 0 && roomba.yVelocity < 0)
    roomba.direction = (2*quarter) + theta;
  else if (roomba.xVelocity < 0 && roomba.yVelocity >= 0)
    roomba.direction = (4*quarter) - theta;
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
  roomba = calculateDirectionAndSpeedFromXYVectors(roomba);
  return roomba;
};

function bounceOffSides(roomba) {
  roomba.xVelocity *= -1;
  roomba = calculateDirectionAndSpeedFromXYVectors(roomba);
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

module.exports = {
  calculateDistance: calculateDistance,
  detectCollisions: detectCollisions,
  separateRoombas: separateRoombas,
  calculateCollisionVectors: calculateCollisionVectors,
  collideVectors: collideVectors,
  convertVectorsToSpeed: convertVectorsToSpeed,
  calculateMovement: calculateMovement,
  calculateDirectionAndSpeed: calculateDirectionAndSpeed,
  convertDirectionToXYVectors: convertDirectionToXYVectors,
  setCollidingAngle: setCollidingAngle,
  collideRoombas: collideRoombas,
  bounceOffSides: bounceOffSides,
  bounceOffTopOrBottom: bounceOffTopOrBottom,
  checkArenaBounds: checkArenaBounds,
  calculateDirectionAndSpeedFromXYVectors: calculateDirectionAndSpeedFromXYVectors
};
