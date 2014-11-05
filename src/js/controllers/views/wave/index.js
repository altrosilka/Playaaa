angular.module('App')
  .controller('C_wave', [
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
    'preloadingSongsCount',
    function($stateParams, $scope, PS_echonest, PS_vk, PS_lastfm, S_utils, S_processing, S_reduce, S_sound, S_logic, preloadingSongsCount) {
      var ctr = {};

      var searchingInProgress = true,
        sessionId, firstTrackStarted = false,
        playedTrackInfo;

      ctr.isTag = ($stateParams.tag) ? true : false;
      ctr.typeLocale = (ctr.isTag) ? 'тегу' : 'исполнителю';
      ctr.query = ($stateParams.tag) ? $stateParams.tag : $stateParams.artist;

      ctr.songs = [];

      ctr.playing = false;
      if ($stateParams.artist && !$stateParams.tag) {
        PS_echonest.call('playlist/dynamic/create', {
          artist: $stateParams.artist,
          type: 'artist-radio'
        }).then(function(resp) {
          sessionId = resp.data.response.session_id;
          loadNextSongs(sessionId);
        });
      }

      if ($stateParams.tag && !$stateParams.artist) {
        PS_echonest.call('playlist/dynamic/create', {
          genre: $stateParams.tag,
          type: 'genre-radio'
        }).then(function(resp) {
          sessionId = resp.data.response.session_id;
          loadNextSongs(sessionId);
        });
      }

      ctr.restart = function(){
        ctr.songs.length = 0;
        PS_echonest.call('playlist/dynamic/restart', {
          session_id: sessionId,
          artist: $stateParams.artist,
          type: 'artist-radio'
        }).then(function(resp) {
          sessionId = resp.data.response.session_id;
          loadNextSongs(sessionId);
        });
      }

      function loadNextSongs(sessionId) {
        PS_echonest.call('playlist/dynamic/next', {
          session_id: sessionId,
          results: 5
        }).then(function(resp) {
          createListeners(resp.data.response.songs);
        });
      }

      function loadByTag(tag) {
        PS_echonest.getStaticPlaylist({
          results: 30,
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
          ctr.songs = ctr.songs.concat(_.filter(tracks, function(track) {
            return _.findIndex(ctr.songs, function(song) {
              return song.id === track.id;
            }) === -1;
          }));
          console.log(ctr.songs.length);

          if (!firstTrackStarted && ctr.songs.length > 0) {
            firstTrackStarted = true;
            if (soundManager.ok()) {
              S_sound.createAndPlay(ctr.songs[0]);
            } else {
              S_sound.onload = function() {
                S_sound.createAndPlay(ctr.songs[0]);
              }
            }
          }
        }, function() {
          searchingInProgress = false;
          S_processing.ready();
          if (playedTrackInfo) {
            var l = ctr.songs.length;
            var i = _.findIndex(ctr.songs, function(song) {
              return playedTrackInfo.id === song.id;
            });
            if (l - i < preloadingSongsCount) {
              loadNextSongs(sessionId);
            }
          }
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
        console.log('started');
        getArtistImage(info.artist);
        playedTrackInfo = info;
        var l = ctr.songs.length;
        var i = _.findIndex(ctr.songs, function(song) {
          return playedTrackInfo.id === song.id;
        });
        if (l - i < preloadingSongsCount && !searchingInProgress) {
          searchingInProgress = true;
          loadNextSongs(sessionId);
        }
        S_sound.create(ctr.songs[i + 1]);
      });

      return ctr;
    }
  ])
