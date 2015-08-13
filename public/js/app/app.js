'use stict';

var app = angular.module('roombah-battle', []);


app.controller('mainController', function(socket){
  
  var vm = this;

  vm.messages = [];

  socket.on('message', function(msg) {
    vm.messages.push(msg);
  });

  vm.broadcast = function() {
    socket.emit('message', vm.message);
    vm.message = null;
  };
  
});

app.factory('socket', function($rootScope) {

  var socket = io.connect();

  service = {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };

  return service;
});
