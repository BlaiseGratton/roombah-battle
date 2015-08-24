'use strict';

app.directive('battleArena', function() {

  return {
    restrict: 'E',
    controller: 'arenaController',
    template: '<canvas id="battle-arena" height="300" width="320"></canvas>',
    replace: true
  };

});
