angular.module('App').controller('C_header', ['$state','$scope','PS_lastfm', function($state, $scope, PS_lastfm) {
  var ctr = this;

  ctr.search = function(q){
    PS_lastfm.artist.getInfo(q).then(function(resp){
      if (!resp.data.artist || resp.data.artist.stats.listeners < 1000 || resp.data.artist.name.toLowerCase() != q.toLowerCase()){
        $state.go('^.discover',{q:q});
      } else {
        $state.go('artistpage',{artist:resp.data.artist.name});
      }
    });   
  }

  $scope.$on('userLogin', function() {
    ctr.visible = true;
  });

  return ctr;
}]);
  