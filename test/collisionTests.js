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

  describe('Setting the Collision Angle:', function() {
    describe('The method', function() {
      it('should properly calculate the colliding angle (1)', function() {
        roomba.x = 80;
        roomba.y = 80;
        roomba = collisions.setCollidingAngle(roomba, roomba1);
        assert.equal(0.7853981633974483, roomba.collidingAngle);
        roomba1 = collisions.setCollidingAngle(roomba1, roomba);
        assert.equal(3.9269908169872414, roomba1.collidingAngle);
      });

      it('should properly calculate the colliding angle (2)', function() {
        roomba.x = 99.9;
        roomba.y = 80;
        roomba = collisions.setCollidingAngle(roomba, roomba2);
        assert.equal(0.004999958333957943, roomba.collidingAngle);
        roomba2 = collisions.setCollidingAngle(roomba2, roomba);
        assert.equal(3.146592611923751, roomba2.collidingAngle);
      });

      it('should properly calculate the colliding angle (3)', function() {
        roomba3.x = 110;
        roomba3.y = 95;
        roomba = collisions.setCollidingAngle(roomba, roomba3);
        assert.equal(2.0344439357957027, roomba.collidingAngle);
        roomba3 = collisions.setCollidingAngle(roomba3, roomba);
        assert.equal(5.176036589385496, roomba3.collidingAngle);
      });

      it('should properly calculate the colliding angle (4)', function() {
        roomba3.x = 110;
        roomba3.y = 102;
        roomba = collisions.setCollidingAngle(roomba, roomba3);
        assert.equal(1.3734007669450157, roomba.collidingAngle);
        roomba3 = collisions.setCollidingAngle(roomba3, roomba);
        assert.equal(4.514993420534809, roomba3.collidingAngle);
      });
    });
  });

  function calculateCollisionVectors(rba) {
    var vectors = { 'independentVector': '', 'collidingVector': '' };
    var φ = Math.abs(rba.collidingAngle - rba.direction);
    vectors.collidingVector = (Math.cos(φ)*rba.speed);
    vectors.independentVector = (Math.tan(φ)*vectors.collidingVector);
    if (Math.abs(rba.direction - rba.collidingAngle) > (Math.PI/2))
      vectors.collidingVector *= (-1);
    if (rba.collidingAngle > rba.direction) 
      vectors.independentDirection = collidingAngle - (Math.PI/2);
    if (rba.collidingAngle < rba.direction)
      vectors.independentDirection = collidingAngle + (Math.PI/2);
    if (vectors.independentDirection < 0) 
      vectors.independentDirection += (2*Math.PI);
    if (vectors.independentDirection > 0)
      vectors.independentDirection -= (2*Math.PI);
    return vectors;
  }

  describe('Calculating Collision Vectors:', function() {
    it('should properly calculate collision vectors (1)', function() {
      roomba.collidingAngle = 1.7853981633974483;
      var vectors = calculateCollisionVectors(roomba);
      assert.equal(0.7641028487401796, vectors.collidingVector);
      assert.equal(1.190019679058772, vectors.independentVector);
    });

    it('should properly calculate collision vectors (2)', function() {
      roomba1.collidingAngle = 2.429398139383974483;
      var vectors = calculateCollisionVectors(roomba1);
      assert.equal(0.7641028487401796, vectors.collidingVector);
      assert.equal(1.190019679058772, vectors.independentVector);
    });

    it('should properly calculate collision vectors (3)', function() {
      roomba2.collidingAngle = 0.539816339742884483;
      var vectors = calculateCollisionVectors(roomba2);
      assert.equal(0.7641028487401796, vectors.collidingVector);
      assert.equal(1.190019679058772, vectors.independentVector);
    });

    it('should properly calculate collision vectors (4)', function() {
      roomba3.collidingAngle = 0.7853981633974483;
      var vectors = calculateCollisionVectors(roomba3);
      assert.equal(0.7641028487401796, vectors.collidingVector);
      assert.equal(1.190019679058772, vectors.independentVector);
    });
  });
});
