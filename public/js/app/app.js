'use stict';

var app = angular.module('roombah-battle', []);


app.controller('mainController', function(socket, $scope){

  var vm = this;

  vm.messages = [];

  socket.on('message', function(msg) {
    vm.messages.push(msg);
  });

  vm.broadcast = function() {
    socket.emit('message', vm.message);
    vm.message = null;
  };

  vm.color = 'blue';

  socket.on('top', function(y) {
    vm.top = y;
  });

  socket.on('right', function(x) {
    vm.right = x;
  });

  socket.on('otherRoombahs', function(roombah) {
    console.log(roombah);
  });

  $scope.$watch('roombah.top', function(y) {
    socket.emit('otherRoombahs', $scope.roombah);
  });

  $scope.$watch('roombah.right', function(x) {
    socket.emit('otherRoombahs', $scope.roombah);
  });

  vm.otherRoombahs = [

    {
      'color': 'blue',
      'top': 0, 
      'right': 0,
      'name': 'DJ Roombah'
    },
    {
      'color': 'red',
      'top': 50,
      'right': -50,
      'name': 'Guy'
    }
  ];

});

app.factory('socket', function($rootScope) {

  var socket = io.connect();

  service = {
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

app.controller('roombahController', function(socket) {
  var vm = this;

});

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
