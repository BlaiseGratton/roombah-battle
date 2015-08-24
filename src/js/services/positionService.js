'use strict';

app.factory('positionService', function() {

  var service = {};

  var changeYDirection = function(roomba) {
    roomba.goingDown = !roomba.goingDown;
  }

  var changeXDirection = function(roomba) {
    roomba.goingRight = !roomba.goingRight;
  }

  var checkArenaBounds = function(roomba) {
    if (roomba.y === 0 || roomba.y === 270) {
      changeYDirection(roomba);
    }
    
    if (roomba.x === 0 || roomba.x === 290) {
      changeXDirection(roomba);
    }
  };

  service.calculateMovement = function(roomba) {
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
