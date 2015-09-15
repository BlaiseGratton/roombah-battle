'use strict';

app.controller('arenaController', function(socket, drawingService) {
  socket.on('roombas', function(roombas) {
    //positionService.setRoombas(roombas);
    drawingService.drawRoombas(roombas);
  });
});
