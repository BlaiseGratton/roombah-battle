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
