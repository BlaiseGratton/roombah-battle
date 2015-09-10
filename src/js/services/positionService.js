'use strict';

app.factory('positionService', function() {

  var service = {};
  var _roomba = {};
  var _roombas = [];

  var bounceOffTopOrBottom = function(roomba) {
    /*var radianDistance = Math.abs(1 - roomba.direction);
    if (_roomba.direction > 1) {
      _roomba.direction = radianDistance;
    } else {
      _roomba.direction = 2 - radianDistance;
    }*/
    _roomba.direction = 2 - roomba.direction;
  };

  var bounceOffSides = function(roomba) {
    if (roomba.direction > 1) {
      _roomba.direction = 2 - (roomba.direction - 1);
    }
    if (roomba.direction <= 1) {
      _roomba.direction = 1 - roomba.direction;
    }
  };

  var checkArenaBounds = function(roomba) {
    if (roomba.y <= 0 + roomba.radius || roomba.y >= 270 - roomba.radius) {
      bounceOffTopOrBottom(roomba);
    }
    if (roomba.x <= 0 + roomba.radius || roomba.x >= 290 - roomba.radius) {
      bounceOffSides(roomba);
    }
  };

  function calculateDistance(roomba1, roomba2) {
    var distance = Math.sqrt(
        Math.pow(roomba1.y - roomba2.y, 2) + 
        Math.pow(roomba1.x - roomba2.x, 2));
    return distance;
  }

  function detectCollisions(roomba, otherRoombas) {
    if (otherRoombas) {
      otherRoombas = otherRoombas.filter(function(rba) {
        return rba.name !== roomba.name;
      });
      otherRoombas.forEach(function(rba) {
        var distance = calculateDistance(roomba, rba);
        if (distance < roomba.radius + rba.radius) {
          collideRoombas(rba);
          //changeXDirection(roomba);
          //changeYDirection(roomba);
        }
      });
    }
  }

  function collideRoombas(rba) {
    
  }

  service.setRoombas = function(roombas) {
    _roombas = roombas;
  };

  service.calculateMovement = function(roomba) {
    _roomba = roomba;
    detectCollisions(roomba, _roombas);
    var dx;
    var dy;
    dx = (_roomba.velocity)*(Math.cos(_roomba.direction * Math.PI));
    dy = (_roomba.velocity)*(Math.sin(_roomba.direction * Math.PI));
    _roomba.x += dx;
    _roomba.y += dy;
    

    /*
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
    */
    checkArenaBounds(_roomba);
    return _roomba;
  };

  return service;
});
