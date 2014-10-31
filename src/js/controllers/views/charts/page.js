angular.module('App')
  .controller('C_charts.page', [
    '$stateParams',
    '$scope',
    'PS_lastfm',
    'S_reduce',
    function($stateParams, $scope, PS_lastfm, S_reduce) {
      var ctr = {};

      var call;
      switch ($stateParams.chartName) {
        case 'popular':
          call = PS_lastfm.chart.getTopTracks();
          break;
        case 'hyped':
          call = PS_lastfm.chart.getHypedTracks();
          break;
        case 'loved':
          call = PS_lastfm.chart.getLovedTracks();
          break;
      }

      call.then(function(resp){
        ctr.songs = S_reduce.normalizeTopTracks(resp.data.tracks.track);
      });


      return ctr;
    }
  ])
