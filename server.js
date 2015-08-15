var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 
    'X-Requested-With,content-type,Authorization');
  next();
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  console.log('a user connected');
  
  socket.on('top', function(y) {
    io.emit('top', y);
  });

  socket.on('right', function(x) {
    io.emit('right', x);
  });

  socket.on('otherRoombahs', function(roombah) {
    socket.broadcast.emit('otherRoombahs', roombah);
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/views/index.html'));
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
