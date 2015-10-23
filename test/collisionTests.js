var assert = require('assert');
var collisions = require('../app/collisions.js');

var roomba, roomba1, roomba2, roomba3;

beforeEach(function() {
  roomba = {
    y = 100,
    x = 100,
    name = "roomba",
    color = "orange",
    radius = 20,
    direction = .55,
    speed = 2,
    xVelocity = function(){
      return roomba.speed*(Math.cos(roomba.cos(roomba.direction * Math.PI);
    }(),
    yVelocity = function(){
      return roomba.speed*(Math.sin(roomba.cos(roomba.direction * Math.PI);
    }(),
  };
  roomba1 = {};
  roomba2 = {};
  roomba3 = {};
});

describe('Simple Tests:', function() {

  describe('Simple test', function() {
    it('should run a simple test', function() {
      assert.equal(false, false);
    });

    it('should fail here', function() {
      assert.equal(false, false);
    });
  });
});

describe('convertVectorsToSpeed:', function() {
  describe('it', function() {
    it('should return the calculated speed', function() {
      assert.equal(20, 20);
    });
  });
});
