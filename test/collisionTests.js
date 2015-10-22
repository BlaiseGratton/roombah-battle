var assert = require('assert');
var collisions = require('../app/collisions.js');

describe('Collisions', function() {

  describe('simpleTest', function() {
    it('should run a simple test', function() {
      assert.equal(false, false);
    });

    it('should fail here', function() {
      assert.equal(false, false);
    });
  });
});
