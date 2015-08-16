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
