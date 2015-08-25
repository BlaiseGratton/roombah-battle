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

var roombas = {};
var roombaArray = [];

io.on('connection', function(socket) {

  var roombaIndex;
  var addedRoomba = false;

  socket.on('join game', function(roomba) {
    console.log(roomba);
    socket.username = roomba.name;
    roombaArray.push(roomba);
    roombaIndex = roombaArray.indexOf(roomba);
    console.log('index: ' + roombaIndex);
    addedRoomba = true;
  });

  socket.on('roombas', function(roomba) {
    roombas[roomba] = roomba;
    roombaArray[roombaIndex] = roomba;
    socket.emit('roombas', roombaArray);
  });

  socket.on('disconnect', function() {
    io.sockets.sockets.map(function(e) {
      console.log(e.username);
      return e.username;
    });

    if (addedRoomba) {
      console.log(socket.username + 'disconnected');
      delete roombas[socket.username];
      roombaArray[roombaIndex] = null;
      socket.broadcast.emit('roomba left');
    }
  });
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
