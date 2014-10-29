angular.module('App').controller('C_controlPanel', [
  '$scope',
  'S_sound',
  'S_modals',
  function($scope, S_sound, S_modals) {
    var ctr = this;

    $scope.playing = false;

    var volumeChanging = false;
    var progressChanging = false;

    $scope.$on('progressChanged', function(e, sm) {
      var progressPercent = sm.position / sm.durationEstimate * 100;

      ctr.currentTime = sm.position / 1000;
      ctr.progress = progressPercent;

      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });


    $scope.$on('progressCalculated', function(e, sm) {

      ctr.totalTime = sm.durationEstimate / 1000;

      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });


    $scope.$on('playStateChanged', function(e, newState) {
      ctr.playing = newState;

      //if (newState) {
      //  localStorage.setItem('trackStart', config.windowID);
      //}
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });

    $scope.$on('volumeChanged', function(e, volume) {
      ctr.volume = volume;

      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
    $scope.$on('trackStarted', function(e, q) {

      ctr.totalTime = q.duration;
      ctr.artist = q.artist;
      ctr.title = q.title;
      ctr.feat = q.feat;

    });

    ctr.title = "asdsad";
    ctr.pause = function() {
      S_sound.togglePause();
    }

    ctr.share = function(){
      S_modals.openShareModal(S_sound.getPlayingTrackInfo());
    }

    ctr.mouseDown = function(event, type) {
      if (event.which !== 1) {
        return;
      }
      switch (type) {
        case "v":
          {
            volumeChanging = true;
            setVolume(event);
            break
          }
        case "p":
          {
            break
          }
      }
      $('body').on('mouseup', function() {
        volumeChanging = false;
        progressChanging = false;
      });
    }

    ctr.mouseMove = function(event, type) {
      switch (type) {
        case "v":
          {
            if (volumeChanging) {
              setVolume(event);
            }
            break
          }
        case "p":
          {
            break
          }
      }
    }
    ctr.mouseLeave = function(event, type) {
      switch (type) {
        case "v":
          {
            volumeChanging = false;
            break
          }
        case "p":
          {
            break
          }
      }
    }

    ctr.mouseUp = function(event, type) {
      switch (type) {
        case "v":
          {
            if (event.which === 1) {
              setVolume(event);
              volumeChanging = false;
            }

            break;
          }

        case "p":
          {
            if (event.which === 1) {
              setProgress(event);
              progressChanging = false;
            }
            break;
          }
      }
      $('body').off('mouseup');
    }


    function getPercent(event) {
      var element = event.currentTarget;
      var width = element.clientWidth - 10;
      var offset = event.offsetX - ((event.target.className === 'volumeHider' || event.target.className === 'progressHider') ? 5 : 0);

      var progress = 100 * (offset / width);
      return progress;
    }

    function setProgress(event) {
      var progress = getPercent(event);
      ctr.progress = progress;
      S_sound.setProgress(progress);
    }

    function setVolume(event) {
      var volume = getPercent(event);
      ctr.volume = volume;
      S_sound.setVolume(volume);
    }



    ctr.play = function() {
      S_sound.togglePause();
    }


    function collect() {
      var playingTrack = $('.track.active').closest('.ng-scope');
      var parent = playingTrack.closest('.list');
      var tracks = parent.children();
      return {
        tracks: tracks,
        length: tracks.length,
        index: playingTrack.index()
      }
    }

    ctr.next = function() {
      var c = collect(),
        el;
      setTimeout(function() {
        if (c.index + 1 >= c.length) {
          el = c.tracks.eq(0).find('.track');
        } else {
          el = c.tracks.eq(c.index + 1).find('.track');
        }
        el.trigger('click');
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, 0);
    }
    ctr.prev = function() {
      var c = collect(),
        el;
      setTimeout(function() {
        if (c.index === 0) {
          el = c.tracks.eq(c.length - 1).find('.track');
        } else {
          el = c.tracks.eq(c.index - 1).find('.track');
        }
        el.trigger('click')
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, 0);
    }

    return ctr;
  }
]);
