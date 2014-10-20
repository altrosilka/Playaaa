angular.module('App')
  .controller('C_playlists', [
    '$stateParams',
    '$scope',
    'PS_echonest',
    'S_utils',
    function($stateParams, $scope, PS_echonest, S_utils) {
      var ctr = {};

      PS_echonest.getGenresList({results: 1000}).then(function(resp) {
        ctr.genreList = S_utils.shuffleArray(resp.data.response.genres);
      });

      return ctr;
    }
  ])
