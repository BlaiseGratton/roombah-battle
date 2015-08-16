'use strict';

var app = angular.module('roombah-battle', []);

'use strict';

app.controller('mainController', function(socket, $scope, positionService, $interval){

  var vm = this;

  socket.on('top', function(y) {
    vm.top = y;
  });

  socket.on('right', function(x) {
    vm.right = x;
  });

  $scope.roombah = {};
  $scope.roombah.top = 0;
  $scope.roombah.right = 0;
  $scope.roombah.goingDown = true;
  $scope.roombah.goingRight = false;
  $scope.roombah.color = 'violet';

  $interval(function() {
    $scope.roombah = positionService.calculateMovement($scope.roombah);
  }, 20);

  socket.on('otherRoombahs', function(roombah) {
    var roombahIndex = vm.roombahNames.indexOf(roombah.name);
    if(roombahIndex > -1) {
      vm.otherRoombahs[roombahIndex] = roombah;
    } else {
      vm.roombahNames.unshift(roombah.name);
      vm.otherRoombahs.unshift(roombah);
    }
  });

  $scope.$watch('roombah.top', function(y) {
    socket.emit('otherRoombahs', $scope.roombah);
  });

  $scope.$watch('roombah.right', function(x) {
    socket.emit('otherRoombahs', $scope.roombah);
  });

  vm.roombahNames = [];

  vm.otherRoombahs = [];

});

'use strict';

app.controller('roombahController', function(socket) {
});

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