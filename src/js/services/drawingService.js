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
