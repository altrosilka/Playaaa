angular.module('App').controller('C_header', ['$state', '$scope', 'PS_lastfm', function($state, $scope, PS_lastfm) {
  var ctr = this;

  ctr.search = function(q) {
    PS_lastfm.artist.search(q).then(function(resp) {
      var matches = resp.data.results.artistmatches;
      if (!matches || !matches.artist[0] || matches.artist[0].listeners < 1000) {
        $state.go('^.discover', {
          q: q
        });
      } else {
        $state.go('artistpage', {
          artist: matches.artist[0].name,
          realQuery: (matches.artist[0].name.toLowerCase() !== q.toLowerCase()) ? q : undefined
        });
      }
    });
  }

  $scope.$on('userLogin', function() {
    ctr.visible = true;
  });

  return ctr;
}]);
