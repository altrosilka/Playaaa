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
    'S_sound',
    'S_logic',
    function($stateParams, $scope, PS_echonest, PS_vk, PS_lastfm, S_utils, S_processing, S_reduce, S_sound, S_logic) {
      var ctr = {};

      ctr.isTag = ($stateParams.tag) ? true : false;
      ctr.typeLocale = (ctr.isTag) ? 'тегу' : 'исполнителю';
      ctr.query = ($stateParams.tag) ? $stateParams.tag : $stateParams.artist;

      ctr.songs = [];
 
      ctr.playing = false;
      if ($stateParams.artist && !$stateParams.tag) {
        var artist = $stateParams.artist;
        PS_echonest.getStaticPlaylist({
          artist: artist,
          bucket: 'id:twitter',
          results: 30
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
        ctr.playing = false;

        var filtTracks = getTracks(songs);

        PS_vk.findTrackArray(filtTracks, function(array, start) {
          var tracks = [];
          $.each(array.response, function(i, val) {
            var pseudo = filtTracks[start + i];
            var q = S_logic.findMostLikelyTrack({
              artist: pseudo.artist,
              title: pseudo.title
            }, val.items);
            if (!q) {

              q = {
                error: true,
                artist: pseudo.artist,
                title: pseudo.title,
                duration: pseudo.duration
              }
            }
            tracks.push(q);
          });
          tracks = S_reduce.filterTracks(tracks, {
            withDurations: true
          });
          ctr.songs = ctr.songs.concat(tracks);

          if (!ctr.playing && ctr.songs.length > 0) {
            ctr.playing = true;
            if (soundManager.ok()) {
              S_sound.createAndPlay(ctr.songs[0]);
            } else {
              S_sound.onload = function() {
                S_sound.createAndPlay(ctr.songs[0]);
              }
            }
          }
        }, function() {
          S_processing.ready();
        });
      }

      function getTracks(tracks) {
        var filteredTracks = [];
        for (var i = 0, l = tracks.length; i < l; i++) {
          var track = tracks[i];
          filteredTracks.push({
            artist: S_utils.prepareTextToExecute(track.artist_name || track.artist),
            title: S_utils.prepareTextToExecute(track.title)
          });
        }
        return filteredTracks;
      }



      function getArtistImage(artist) {
        PS_lastfm.artist.getInfo(artist).then(function(resp) {
          var src = resp.data.artist;

          if (!src || !src.image || src.image[src.image.length - 1]['#text'] === '') {
            var t = new Trianglify();
            var pattern = t.generate(document.body.clientWidth, document.body.clientHeight);
            ctr.artistInfo = {
              name: artist,
              image: pattern.dataUri
            }
          } else {
            ctr.artistInfo = {
              name: src.name,
              image: src.image[src.image.length - 1]['#text']
            }
          }
        });
      }

      $scope.$on('trackStarted', function(event, info) {
        getArtistImage(info.artist);
      })

      return ctr;
    }
  ])
