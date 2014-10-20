angular.module('App').controller('C_header', ['$state','PS_lastfm', function($state, PS_lastfm) {
  var ctr = this;

  ctr.search = function(q){
    PS_lastfm.artist.getInfo(q).then(function(resp){
      if (!resp.data.artist || resp.data.artist.stats.listeners < 100 || resp.data.artist.name.toLowerCase() != q.toLowerCase()){
        $state.go('^.discover',{q:q});
      } else {
        $state.go('artistpage',{artist:resp.data.artist.name});
      }
    });   
  }

  return ctr;
}]);
  