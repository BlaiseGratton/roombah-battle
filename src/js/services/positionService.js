'use strict';

app.factory('positionService', function() {

  var service = {};

  var _roombas = [];

  var changeYDirection = function(roomba) {
    roomba.goingDown = !roomba.goingDown;
  };

  var changeXDirection = function(roomba) {
    roomba.goingRight = !roomba.goingRight;
  };

  var checkArenaBounds = function(roomba) {
    if (roomba.y === 0 || roomba.y === 270) {
      changeYDirection(roomba);
    }
    if (roomba.x === 0 || roomba.x === 290) {
      changeXDirection(roomba);
    }
  };

  function calculateDistance(roomba1, roomba2) {
    var distance = Math.sqrt(
        Math.pow(roomba1.y - roomba2.y, 2) + 
        Math.pow(roomba1.x - roomba2.x, 2));
    return distance;
  }

  function detectCollisions(roomba, otherRoombas) {
    otherRoombas = otherRoombas.filter(function(rba) {
      return rba.name !== roomba.name;
    });
    if (otherRoombas) {
      otherRoombas.forEach(function(rba) {
        var distance = calculateDistance(roomba, rba);
        if (distance < roomba.radius + rba.radius) {
          changeXDirection(roomba);
          changeYDirection(roomba);
        }
      });
    }
  }

  service.setRoombas = function(roombas) {
    _roombas = roombas;
  };

  service.calculateMovement = function(roomba) {
    detectCollisions(roomba, _roombas);
    if (roomba.goingDown) {
      roomba.y++;
    } else {
      roomba.y--;
    }
    if (roomba.goingRight) {
      roomba.x--;
    } else {
      roomba.x++;
    }
    checkArenaBounds(roomba);
    return roomba;
  };

  return service;
});
