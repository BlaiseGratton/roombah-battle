var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var collisions = require('./app/collisions.js');

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



var roombaArray = [];

setInterval(function() {
  roombaArray = collisions.calculateMovement(collisions.detectCollisions(roombaArray));
}, 20);

io.on('connection', function(socket) {
  var roombaIndex;
  var addedRoomba = false;
  socket.on('join game', function(roomba) {
    socket.username = roomba.name;
    roombaArray.push(roomba);
    roombaIndex = roombaArray.indexOf(roomba);
    addedRoomba = true;
  });

  socket.on('requestRoombas', function() {
    socket.emit('roombas', roombaArray);
  });
  /*

  socket.on('roomba left', function(index) {
    console.log('user left');
    console.log(index);
  });

  socket.on('disconnect', function() {
    if (addedRoomba) {
      console.log(socket.username + ' disconnected');

      roombaArray[roombaIndex] = null;
      //socket.broadcast.emit('roomba left', roombaIndex);
    }
  });
  */
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
