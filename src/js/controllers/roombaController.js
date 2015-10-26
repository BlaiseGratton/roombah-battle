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
