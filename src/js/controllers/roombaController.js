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
  vm.roomba.velocity = 2;
  vm.roomba.xVelocity = function() {
    return (vm.roomba.velocity)*(Math.cos(vm.roomba.direction * Math.PI));
  }();
  vm.roomba.yVelocity = function() {
    return (vm.roomba.velocity)*(Math.sin(vm.roomba.direction * Math.PI));
  }();
  vm.roomba.collidingWith = [];

  vm.joinGame = function() {
    socket.emit('join game', vm.roomba);
    $interval(function() {
      socket.emit('requestRoombas');
    }, 15);
  };
});
