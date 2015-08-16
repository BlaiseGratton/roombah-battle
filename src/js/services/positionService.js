'use strict';

app.factory('positionService', function() {

  var service = {};

  var changeYDirection = function(roombah) {
    roombah.goingDown = !roombah.goingDown;
  }

  var changeXDirection = function(roombah) {
    roombah.goingRight = !roombah.goingRight;
  }

  var checkArenaBounds = function(roombah) {
    if (roombah.top === 0 || roombah.top === 270) {
      changeYDirection(roombah);
    }
    
    if (roombah.right === 0 || roombah.right === 290) {
      changeXDirection(roombah);
    }
  };

  service.calculateMovement = function(roombah) {
    if (roombah.goingDown) {
      roombah.top++;
    } else {
      roombah.top--;
    }
    if (roombah.goingRight) {
      roombah.right--;
    } else {
      roombah.right++;
    }
    checkArenaBounds(roombah);
    return roombah;
  };

  return service;

});
