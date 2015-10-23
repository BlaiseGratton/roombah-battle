'use strict';

app.controller('roombaController', function($interval, socket) {

  var vm = this;

  vm.roomba = {};
  vm.roomba.y = 100;
  vm.roomba.x = 100;
  vm.roomba.name = "Guy";
  vm.roomba.color = 'orange';
  vm.roomba.radius = 20;
  vm.roomba.direction = .55;
  vm.roomba.speed = 2;
  vm.roomba.xVelocity = undefined;
  vm.roomba.yVelocity = undefined;
  vm.roomba.collidingWith = [];

  function calculateXAndYVelocities(direction, speed) {
    var theta;
    if (direction < .5)
      theta = direction;
    else if (direction < 1)
      theta = direction - .5;
    else if (direction < 1.5)
      theta = direction - 1;
    else if (direction < 2)
      theta = direction - 1.5;
    vm.roomba.xVelocity = speed * (Math.sin((direction * Math.PI)));
    vm.roomba.yVelocity = speed * (Math.cos((direction * Math.PI)));
    if (direction > 1)
      vm.roomba.yVelocity *= (-1);
    if (direction > .5 && direction < 1.5)
      vm.roomba.xVelocity *= (-1);
  }

  vm.joinGame = function() {
    calculateXAndYVelocities(vm.roomba.direction, vm.roomba.speed);
    socket.emit('join game', vm.roomba);
    $interval(function() {
      socket.emit('requestRoombas');
    }, 15);
  };
});
