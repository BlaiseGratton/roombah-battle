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

app.controller('arenaController', function(socket, drawingService) {

  var vm = this;

  socket.on('roombas', function(roombas) {
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

  $interval(function() {
    vm.roomba = positionService.calculateMovement(vm.roomba);
    socket.emit('roombas', vm.roomba);
  }, 20);

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
    debugger
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