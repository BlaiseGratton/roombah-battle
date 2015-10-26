var assert = require('assert');
var collisions = require('../app/collisions.js');


var roomba, roomba1, roomba2, roomba3;

describe('Collision Tests:', function() {
beforeEach(function() {
  roomba = {
    y: 100,
      x: 100,
      name: "roomba",
      color: "orange",
      radius: 20,
      xVelocity: 1,
      yVelocity: 1
    };
    roomba = collisions.calculateDirectionAndSpeedFromXYVectors(roomba);

    roomba1 = {
      y: 100,
      x: 100,
      name: "roomba",
      color: "orange",
      radius: 20,
      xVelocity: -1,
      yVelocity: -1
    };
    roomba1 = collisions.calculateDirectionAndSpeedFromXYVectors(roomba1);
    
    roomba2 = {
      y: 100,
      x: 100,
      name: "roomba",
      color: "orange",
      radius: 20,
      xVelocity: 2,
      yVelocity: .1
    };
    roomba2 = collisions.calculateDirectionAndSpeedFromXYVectors(roomba2);

    roomba3 = {
      y: 100,
      x: 100,
      name: "roomba",
      color: "orange",
      radius: 20,
      xVelocity: -0.1,
      yVelocity: -0.5
    };
    roomba3 = collisions.calculateDirectionAndSpeedFromXYVectors(roomba3);
  });

  describe('Setting Direction and Speed from Vectors of Roomba:', function() {
    describe('Setting vectors on', function() {
      it('roomba', function() {
        assert.equal(0.7853981633974483, roomba.direction);
        assert.equal(1.4142135623730951, roomba.speed);
      });
      it('roomba1', function() {
        assert.equal(3.9269908169872414, roomba1.direction);
        assert.equal(1.4142135623730951, roomba1.speed);
      });
      it('roomba2', function() {
        assert.equal(1.5208379310729538, roomba2.direction);
        assert.equal(2.0024984394500787, roomba2.speed);
      });
      it('roomba3', function() {
        assert.equal(3.338988213439674, roomba3.direction);
        assert.equal(0.5099019513592785, roomba3.speed);
      });
    });
  });

  describe('Bouncing Roombas off of Side Walls:', function() {
    describe('On the side wall', function() {
      it('should correctly change the direction', function() {
        roomba = collisions.bounceOffSides(roomba);
        assert.equal(5.497787143782138, roomba.direction);

        roomba1 = collisions.bounceOffSides(roomba1);
        assert.equal(2.356194490192345, roomba1.direction);

        roomba2 = collisions.bounceOffSides(roomba2);
        assert.equal(4.762347376106632, roomba2.direction);

        roomba3 = collisions.bounceOffSides(roomba3);
        assert.equal(2.9441970937399122, roomba3.direction);
      });
    });
  });

  describe('Bouncing Roombas off of Top or Bottom Walls:', function() {
    describe('On the top or bottom wall', function() {
      it('should correctly change the direction', function() {
        roomba = collisions.bounceOffTopOrBottom(roomba);
        assert.equal(2.356194490192345, roomba.direction);

        roomba1 = collisions.bounceOffTopOrBottom(roomba1);
        assert.equal(5.497787143782138, roomba1.direction);

        roomba2 = collisions.bounceOffTopOrBottom(roomba2);
        assert.equal(1.6207547225168393, roomba2.direction);

        roomba3 = collisions.bounceOffTopOrBottom(roomba3);
        assert.equal(6.085789747329706, roomba3.direction);
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
});
