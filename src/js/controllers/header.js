angular.module('App').controller('C_header', ['$state', function($state) {
  var ctr = this;

  ctr.search = function(q){
    $state.go('^.discover',{q:q});
  }

  return ctr;
}]);
 