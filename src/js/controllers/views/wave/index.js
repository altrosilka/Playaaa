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
      var ctr = this;

      var searchingInProgress = true,
        searchingInVkInProgress = false,
        sessionId, firstTrackStarted = false,
        playedTrackInfo = {};

      ctr.isTag = ($stateParams.tag) ? true : false;
      ctr.typeLocale = (ctr.isTag) ? 'тегу' : 'исполнителю';
      ctr.query = undefined;

      ctr.songs = [];

      ctr.playing = false;



      $scope.$on('startArtistWave', function(e, artist) {
        ctr.query = artist;
        PS_echonest.call('playlist/dynamic/create', {
          artist: artist,
          type: 'artist-radio'
        }).then(function(resp) {
          sessionId = resp.data.response.session_id;
          loadNextSongsFromEchonest(sessionId, true);
        });
      });

      if ($stateParams.tag && !$stateParams.artist) {
        PS_echonest.call('playlist/dynamic/create', {
          genre: $stateParams.tag,
          type: 'genre-radio'
        }).then(function(resp) {
          sessionId = resp.data.response.session_id;
          loadNextSongsFromEchonest(sessionId);
        });
      }

      ctr.restart = function() {
        ctr.songs.length = 0;
        PS_echonest.call('playlist/dynamic/restart', {
          session_id: sessionId,
          artist: $stateParams.artist,
          type: 'artist-radio'
        }).then(function(resp) {
          sessionId = resp.data.response.session_id;
          loadNextSongsFromEchonest(sessionId);
        });
      }

      function loadNextSongsFromEchonest(sessionId, firstCall) {
        searchingInProgress = true;
        PS_echonest.call('playlist/dynamic/next', {
          session_id: sessionId,
          results: 5
        }).then(function(resp) {
          searchingInProgress = false;

          var filteredArtist = _.filter(S_reduce.remapTracks(resp.data.response.songs, {
            artist: 'artist_name'
          }), function(q) {
            return _.findIndex(ctr.songs, function(song) {
              return song.artist === q.artist && song.title === q.title;
            }) === -1;
          });


          if (!filteredArtist.length) {
            loadNextSongsFromEchonest(sessionId);
          }

          ctr.songs = ctr.songs.concat(filteredArtist);
          if (firstCall) {
            loadNextTrack();
          }
        });
      }




      function rulituLoadFromEchonest() {
        if (!playedTrackInfo || searchingInProgress) return;

        var currentTrackIndex = _.findIndex(ctr.songs, function(song) {
          return song.id === playedTrackInfo.id;
        });

        var l = ctr.songs.length;

        if (l - currentTrackIndex < preloadingSongsCount) {
          loadNextSongsFromEchonest(sessionId);
        }
      }



      function loadNextTrack() {
        if (searchingInVkInProgress) return;

        var newTrackIndex = _.findIndex(ctr.songs, function(song) {
          return !song.url;
        });
        var newTrackInfo = ctr.songs[newTrackIndex];

        var currentTrackIndex = _.findIndex(ctr.songs, function(song) {
          return song.id === playedTrackInfo.id;
        });

        if (newTrackIndex - currentTrackIndex <= 2) {
          loadNextSongsFromVk(newTrackInfo);
        }
      }

      function loadNextSongsFromVk(track) {
        searchingInVkInProgress = true;
        if (!track) {

          return;
        }
        PS_vk.search({
          q: track.artist + ' ' + track.title,
          count: 100
        }).then(function(resp) {
          searchingInVkInProgress = false;
          if (!resp.response || resp.response.items.length === 0) {
            _.remove(ctr.songs, function(song) {
              return _.isEqual(song, track);
            });
            loadNextTrack();
            rulituLoadFromEchonest();
            return;
          }

          var q = S_logic.findMostLikelyTrack({
            artist: track.artist,
            title: track.title
          }, resp.response.items);

          if (_.findIndex(ctr.songs, function(song) {
              return song.id === q.id;
            }) === -1) {
            track = angular.extend(track, q);
          }

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
          console.log(ctr.songs);
          loadNextTrack();
          rulituLoadFromEchonest();
        });
      }


      /*

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
      */


      $scope.$on('trackStarted', function(event, info) {
        if ($scope.ctr.radioMode) {

          var currentTrackIndex = _.findIndex(ctr.songs, function(song) {
            return song.id === playedTrackInfo.id;
          });
          
          if (currentTrackIndex === -1 && ctr.songs.length && ctr.songs[0].id){
            $scope.ctr.radioMode = false;
            $scope.ctr.radioListIsOpened = false;
            ctr.songs = [];
            return;
          }

          playedTrackInfo = info;
          loadNextTrack();
          rulituLoadFromEchonest();
        }


      });

      ctr.setSongNewInfo = function(song, info) {
        angular.extend(song, info);
      }

      ctr.toggleList = function() {
        $scope.ctr.radioListIsOpened = !$scope.ctr.radioListIsOpened;
      }

      return this;
    }
  ])
