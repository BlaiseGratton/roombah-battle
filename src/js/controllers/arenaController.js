'use strict';

app.controller('arenaController', function(socket, drawingService) {

  socket.on('roombas', function(roombas) {
    drawingService.drawRoombas(roombas);
  });

});
