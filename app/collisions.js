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
  var direction = roomba.collidingAngle + (
    Math.atan(vectors.independentVector/vectors.collidingVector)
  );
  roomba.collidingAngle = 0;

  if (direction > (2*Math.PI))
    direction -= (2*Math.PI);
  if (direction < 0)
    direction += (2*Math.PI);
  return direction;
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
  var theta;
  if (roomba.direction > .5)
    theta = roomba.direction;
  else if (roomba.direction < 1)
    theta = roomba.direction  - .5;
  else if (roomba.direction < 1.5)
    theta = roomba.direction - 1;
  else if (roomba.direction < 2)
    theta = direction - 1.5;
  roomba.xVelocity = roomba.speed * (Math.sin(theta));
  roomba.yVelocity = roomba.speed * (Math.cos(theta));
  var quadrant = (2*Math.PI)/4;
  if (roomba.direction > (2*quadrant))
    roomba.xVelocity *= (-1);
  if (roomba.direction > quadrant && roomba.direction < (3*quadrant))
    roomba.yVelocity *= (-1);
  return roomba;
}

function setCollidingAngle(roomba, otherRoomba, collisionAngle) {
  var quadrant = (2*Math.PI)/4;
  var collidingAngle;
  if (roomba.y > otherRoomba.y) {
    if (roomba.x < otherRoomba.x) 
      collidingAngle = quadrant - collisionAngle;
    if (roomba.x > otherRoomba.x)
      collidingAngle = (4*quadrant) - collisionAngle;
  }
  if (roomba.y < otherRoomba.y) {
    if (roomba.x > otherRoomba.x)
      collidingAngle = (3*quadrant) - collisionAngle;
    if (roomba.x < otherRoomba.x)
      collidingAngle = (2*quadrant) - collisionAngle;
  }
  return collidingAngle;
}

function collideRoombas(roomba1, roomba2, roombas) {
  var idx1 = roombas.indexOf(roomba1);
  var idx2 = roombas.indexOf(roomba2);
  var dx = Math.abs(roomba1.x - roomba2.x);
  var dy = Math.abs(roomba1.y - roomba2.y);
  var collisionAngle = Math.atan(dy/dx);
  roomba1.collidingAngle = setCollidingAngle(roomba1, roomba2, collisionAngle);
  roomba2.collidingAngle = setCollidingAngle(roomba2, roomba1, collisionAngle);
  var rba1Vectors = calculateCollisionVectors(roomba1, roomba1.speed);
  var rba2Vectors = calculateCollisionVectors(roomba2, roomba2.speed);
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
  calculateDirection: calculateDirection,
  convertDirectionToXYVectors: convertDirectionToXYVectors,
  setCollidingAngle: setCollidingAngle,
  collideRoombas: collideRoombas,
  bounceOffSides: bounceOffSides,
  bounceOffTopOrBottom: bounceOffTopOrBottom,
  checkArenaBounds: checkArenaBounds
};
