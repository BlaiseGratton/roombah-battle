'use strict';

app.controller('arenaController', function(socket, drawingService) {

  var vm = this;

  socket.on('roombas', function(roombas) {
    drawingService.drawRoombas(roombas);
  });
  
});
