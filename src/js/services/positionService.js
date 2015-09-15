'use strict';

app.factory('positionService', function() {

  var service = {};
  var _roomba = {};
  var _roombas = [];

  var bounceOffTopOrBottom = function(roomba) {
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
      if (roomba.y < 0) roomba.y = 0;
      if (roomba.y > 270) roomba.y = 270;
    }
    if (roomba.x <= 0 + roomba.radius || roomba.x >= 290 - roomba.radius) {
      bounceOffSides(roomba);
      if (roomba.x < 0) roomba.x = 0;
      if (roomba.x > 290) roomba.x = 290;
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
        if (distance < roomba.radius + rba.radius + .5) {
          collideRoombas(rba);
        }
      });
    }
  }

  function collideRoombas(rba) {
    var dx = Math.abs(rba.x - _roomba.x);
    var dy = Math.abs(rba.y - _roomba.y);
    var angle = Math.atan(dx/dy);
    if (_roomba.y >= rba.y)
      _roomba.direction = 2 - angle;
    if (_roomba.y < rba.y)
      _roomba.direction = angle;
  }

  service.setRoombas = function(roombas) {
    _roombas = roombas;
  };

  service.calculateMovement = function(roomba) {
    if (_roombas.length !== 0) {
      _roomba = _roombas.filter(function(rba) {
        if (rba.name === roomba.name) {
          return rba;
        }
      });
      _roomba = _roomba[0];
    } else {
      _roomba = roomba;
    }
    var dx;
    var dy;
    dx = (_roomba.velocity)*(Math.cos(_roomba.direction * Math.PI));
    dy = (_roomba.velocity)*(Math.sin(_roomba.direction * Math.PI));
    _roomba.x += dx;
    _roomba.y += dy;
    checkArenaBounds(_roomba);
    return _roomba;
  };

  return service;
});
