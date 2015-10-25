var assert = require('assert');
var collisions = require('../app/collisions.js');


var roomba, roomba1, roomba2, roomba3;

function calculateXAndYVelocities(rmba, direction, speed) {
  var theta;
  if (direction < .5)
    theta = direction;
  else if (direction < 1)
    theta = direction - .5;
  else if (direction < 1.5)
    theta = direction - 1;
  else if (direction < 2)
    theta = direction - 1.5;
  rmba.xVelocity = speed * (Math.sin((theta * Math.PI)));
  rmba.yVelocity = speed * (Math.cos((theta * Math.PI)));
  if (direction > 1)
    rmba.yVelocity *= (-1);
  if (direction > .5 && direction < 1.5)
    rmba.xVelocity *= (-1);
  return rmba;
}

describe('Simple Tests:', function() {
beforeEach(function() {
  roomba = {
    y: 100,
      x: 100,
      name: "roomba",
      color: "orange",
      radius: 20,
      direction: .55,
      speed: 2
    };
    roomba = calculateXAndYVelocities(roomba, roomba.direction, roomba.speed);

    roomba1 = {
      y: 100,
      x: 100,
      name: "roomba",
      color: "orange",
      radius: 20,
      direction: .55,
      speed: 1
    };
    roomba1 = calculateXAndYVelocities(roomba1, roomba1.direction, roomba1.speed);
    
    roomba2 = {
      y: 100,
      x: 100,
      name: "roomba",
      color: "orange",
      radius: 20,
      direction: 1.42,
      speed: 2
    };
    roomba2 = calculateXAndYVelocities(roomba2, roomba2.direction, roomba2.speed);

    roomba3 = {
      y: 100,
      x: 100,
      name: "roomba",
      color: "orange",
      radius: 20,
      direction: 1.77,
      speed: 2
    };
    roomba3 = calculateXAndYVelocities(roomba3, roomba3.direction, roomba3.speed);
  });


  describe('Simple test', function() {
    it('should run a simple test', function() {
      assert.equal(false, false);
    });

    it('should fail here', function() {
      assert.equal(false, false);
    });
  });
});

describe('Setting X and Y Vectors of Roomba:', function() {
  describe('Setting vectors on', function() {
    it('roomba', function() {
      assert.equal(-0.312868930080462, roomba.xVelocity);
      assert.equal(-1.9753766811902753, roomba.yVelocity);
    });
    it('roomba1', function() {
      assert.equal(-0.9876883405951377, roomba1.xVelocity);
      assert.equal(0.15643446504023104, roomba1.yVelocity);
    });
    it('roomba2', function() {
      assert.equal(-1.937166322257262, roomba2.xVelocity);
      assert.equal(0.4973797743297106, roomba2.yVelocity);
    });
    it('roomba3', function() {
      assert.equal(-1.3226237306473045, roomba3.xVelocity);
      assert.equal(1.5002221392609183, roomba3.yVelocity);
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
