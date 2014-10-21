angular.module('App')
  .controller('C_flow', [
    '$stateParams',
    '$scope',
    'PS_echonest',
    'PS_vk',
    'PS_lastfm',
    'S_utils',
    'S_processing',
    'S_reduce',
    function($stateParams, $scope, PS_echonest, PS_vk, PS_lastfm, S_utils, S_processing, S_reduce) {
      var ctr = {};

      console.log($stateParams);

      ctr.type = ($stateParams.tag) ? 'тегу' : 'исполнителю';
      ctr.query = ($stateParams.tag) ? $stateParams.tag : $stateParams.artist;

      ctr.songs = [];
      if ($stateParams.artist && !$stateParams.tag) {
        var artist = $stateParams.artist;
        PS_echonest.getStaticPlaylist({
          artist: artist,
          results: 25
        }).then(function(resp) {
          createListeners(resp.data.response.songs)
        });
      }

      if ($stateParams.tag && !$stateParams.artist) {
        var tag = $stateParams.tag;
        PS_echonest.getStaticPlaylist({
          results: 12,
          type: 'genre-radio',
          genre: tag
        }).then(function(resp) {
          createListeners(resp.data.response.songs);
        }, function() {
          PS_lastfm.tag.getTopTracks(tag).then(function(resp) {
            createListeners(S_reduce.normalizeTopTracks(resp.data.toptracks.track));
          });
        });
      }

      function createListeners(songs) {
        console.log(songs);


        var filtTracks = getTracks(songs);

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

          ctr.songs = ctr.songs.concat(tracks);

        }, function() {
          S_processing.ready();
        });
      }


      function getTracks(tracks) {
        var filteredTracks = [];
        for (var i = 0, l = tracks.length; i < l; i++) {
          var track = tracks[i];
          filteredTracks.push({
            artist: track.artist_name || track.artist,
            title: track.title
          });
        }
        return filteredTracks;
      }






      return ctr;
    }
  ])
