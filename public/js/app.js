'use strict';

var app = angular.module('roomba-battle', []);

'use strict';

app.controller('arenaController', function(socket, drawingService) {
  socket.on('roombas', function(roombas) {
    //positionService.setRoombas(roombas);
    drawingService.drawRoombas(roombas);
  });
});

'use strict';

app.controller('mainController', function(){
  var vm = this;
});

'use strict';

app.controller('roombaController', function($interval, socket) {

  var vm = this;

  vm.roomba = {};
  vm.roomba.y = 100;
  vm.roomba.x = 100;
  vm.roomba.name = "Guy";
  vm.roomba.color = 'orange';
  vm.roomba.radius = 20;
  vm.roomba.direction = 0;
  vm.roomba.speed = 0;
  vm.roomba.xVelocity = 1;
  vm.roomba.yVelocity = .1;
  vm.roomba.collidingWith = [];

  function calculateDirectionAndSpeedFromXYVectors(roomba) {
    var quarter = ((2*Math.PI)/4);
    vm.roomba.speed = Math.sqrt(Math.pow(roomba.xVelocity, 2) + Math.pow(roomba.yVelocity, 2));
    var theta = Math.abs(Math.atan(roomba.xVelocity/roomba.yVelocity));
    if (roomba.xVelocity >= 0 && roomba.yVelocity >= 0)
      roomba.direction = theta;
    else if (roomba.xVelocity >= 0 && roomba.yVelocity < 0)
      roomba.direction = quarter + theta;
    else if (roomba.xVelocity < 0 && roomba.yVelocity < 0)
      roomba.direction = (2*quarter) + theta;
    else if (roomba.xVelocity < 0 && roomba.yVelocity >= 0)
      roomba.direction = (3*quarter) + theta;
    return roomba;
  }

  vm.joinGame = function() {
    //calculateXAndYVelocities(vm.roomba.direction, vm.roomba.speed);
    vm.roomba = calculateDirectionAndSpeedFromXYVectors(vm.roomba);
    socket.emit('join game', vm.roomba);
    $interval(function() {
      socket.emit('requestRoombas');
    }, 15);
  };
});

'use strict';

app.factory('drawingService', function() {

  var service = {};
  var canvas = document.querySelector('#battle-arena');
  var ctx;

  function drawRoomba(roomba) {
    ctx.beginPath();
    ctx.arc(roomba.x, roomba.y, roomba.radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fillStyle = roomba.color;
    ctx.fill();
  };

  if (canvas.getContext) {
    ctx = canvas.getContext('2d');
    ctx.width = 320;
    ctx.height = 300;
    ctx.fillStyle = 'white';
    ctx.rect(0, 0, 320, 300);
    ctx.fill();
  }

  service.drawRoombas = function(roombas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    roombas.forEach(function(roomba) {
      drawRoomba(roomba);
    });
  } 

  return service;
});

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

'use strict';

app.factory('socket', function($rootScope) {

  var socket = io.connect();

  var service = {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };

  return service;
});

'use strict';

app.directive('battleArena', function() {

  return {
    restrict: 'E',
    controller: 'arenaController',
    template: '<canvas id="battle-arena" height="300" width="320"></canvas>',
    replace: true
  };

});

'use strict';

app.directive('roombah', function(socket) {
  return {
    restrict: 'E',
    template: '<div class="roombah">{{ roombah.name }}</div>', 
    replace: true,
    bindToController: {
      'top': '=',
      'right': '=',
      'color': '=',
      'name': '='
    },
    controller: 'roombahController',
    controllerAs: 'rmbCtrl',
    link:function (scope, element, attrs) {
      scope.$watch(attrs.top, function (y) {
        element.css('top', y + 'px');
        socket.emit('top', y);
      });
      scope.$watch(attrs.right, function (x) {
        element.css('right', x + 'px');
        socket.emit('right', x);
      });
      scope.$watch(attrs.color, function (color) {
        element.css('backgroundColor', color);
      });
    }
  };
});

//# sourceMappingURL=app.js.map