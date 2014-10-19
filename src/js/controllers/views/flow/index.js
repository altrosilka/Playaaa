angular.module('App')
  .controller('C_flow', ['$stateParams', '$scope', 'PS_echonest', 'PS_vk', 'S_utils','S_processing', function($stateParams, $scope, PS_echonest, PS_vk, S_utils, S_processing) {
    var ctr = {};

    console.log($stateParams);

    ctr.type = ($stateParams.tag) ? 'тегу' : 'исполнителю';
    ctr.query = ($stateParams.tag) ? $stateParams.tag : $stateParams.artist;

    ctr.songs = [];
    if ($stateParams.artist && !$stateParams.tag) {
      var artist = $stateParams.artist;
      PS_echonest.getArtistRadio({
        artist: artist,
        results: 12
      }).then(function(resp) {
        console.log(resp);

        var filtTracks = getTracks(resp.data.response.songs);
        
        PS_vk.findTrackArray(filtTracks, function(array, start) {
          console.log('part!');
          var tracks = [];
          $.each(array.response, function(i, val) {
            var q = val.items[0];
            if (!q) {
              var pseudo = filtTracks[start + i];
              q = {
                error: true,
                artist: pseudo.artist,
                title: pseudo.title,
                duration: pseudo.duration
              }
            }
            tracks.push(q);
          });
          tracks = S_utils.filterAudios(tracks, true);

          $scope.$apply(function(){
            ctr.songs = ctr.songs.concat(tracks);
          });
        }, function() {
          S_processing.ready();
        });
      })
    }
 



    function getTracks(tracks) {
      var filteredTracks = [];
      for (var i = 0, l = tracks.length; i < l; i++) {
        var track = tracks[i];
        filteredTracks.push({
          artist: track.artist_name,
          title: track.title
        });
      }
      return filteredTracks;
    }






    return ctr;
  }])
