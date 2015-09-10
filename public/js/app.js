'use strict';

var app = angular.module('roomba-battle', []);

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

'use strict';

app.controller('arenaController', function(socket, drawingService, positionService) {
  socket.on('roombas', function(roombas) {
    positionService.setRoombas(roombas);
    drawingService.drawRoombas(roombas);
  });
});

'use strict';

app.controller('mainController', function(){
  var vm = this;
});

'use strict';

app.controller('roombaController', function(drawingService, $interval, positionService, socket) {

  var vm = this;

  vm.roomba = {};
  vm.roomba.y = 100;
  vm.roomba.x = 100;
  vm.roomba.name = "Guy";
  vm.roomba.color = 'orange';
  vm.roomba.radius = 20;
  vm.roomba.direction = .55;
  vm.roomba.velocity = 2;

  vm.joinGame = function() {
    socket.emit('join game', vm.roomba);
    $interval(function() {
      vm.roomba = positionService.calculateMovement(vm.roomba);
      socket.emit('roombas', vm.roomba);
    }, 20);
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

//# sourceMappingURL=app.js.map