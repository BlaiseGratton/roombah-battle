'use strict';

app.controller('arenaController', function(socket, drawingService, positionService) {
  socket.on('roombas', function(roombas) {
    positionService.setRoombas(roombas);
    drawingService.drawRoombas(roombas);
  });
});
