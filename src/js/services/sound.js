angular.module('App')
  .service('S_sound', ['$rootScope','S_utils','S_enviroment',function($rootScope, S_utils, S_enviroment) {


    var service = {};

    var currentSound, currentSoundId;

    var volume;

    var bitrateObject = {};

    service.getVolume = function() {
      var v = S_utils.getCookie('volume');
      if (v === '') {
        v = 50;
      }
      return +v; 
    }

    service.init = function($root) {
      


      soundManager.setup({
        url: '/static/js/libs/sm/swf',
        allowScriptAccess: 'always',
        flashVersion: 9,
        useHighPerformance: true,
        preferFlash: true,
        useConsole: false,
        onready: function() {

        },
        onload: function() {

        },
        waitForWindowLoad: true,
        ontimeout: function() {

        }
      });


      soundManager.defaultOptions = {
        autoLoad: true, // enable automatic loading (otherwise .load() will call with .play())
        autoPlay: false, // enable playing of file ASAP (much faster if "stream" is true)
        from: null, // position to start playback within a sound (msec), see demo
        loops: 1, // number of times to play the sound. Related: looping (API demo)
        multiShot: true, // let sounds "restart" or "chorus" when played multiple times..
        multiShotEvents: false, // allow events (onfinish()) to fire for each shot, if supported.
        pan: 0,
        volume: volume,
        stream: true
      }

      soundManager.onload = function() {
        var v = service.getVolume();
        service.setVolume(v);

        if (typeof service.onload === 'function') {
          service.onload();
        }
      }

    }

    service.checkBitRate = function(id, url, duration, $scope) {

      if (bitrateObject[id]) {
        $scope.bitrate = bitrateObject[id];
        return;
      }

      var pos = url.lastIndexOf('?');
      url = url.slice(0, pos);

      var soundID = 'br' + id;
      var sound = soundManager.createSound({
        volume: 10,
        id: soundID,
        url: url,
        autoLoad: true,
        autoPlay: false,
        whileloading: function() {
          if (this.bytesLoaded > 50) {
            var z = this.bytesTotal;

            var br = Math.floor(z / 1024 * 8 / duration);
            bitrateObject[id] = br;
            $scope.bitrate = br;

            setTimeout(function() {

              if (!$scope.$$phase) {
                $scope.$apply();
              }
            }, 0)
            if (!this.playState) {
              soundManager.unload(soundID);
            }
            $scope.error = false;
          }
        }
      });

    }

    service.getSound = function() {
      return currentSound;
    }
    service.getSoundId = function() {
      return currentSoundId;
    }

    service.setVolume = function(v) {
      v = +v;
      if (v < 0) {
        v = 0;
      }

      if (v > 100) {
        v = 100;
      }


      volume = v;
      if (currentSound) {
        currentSound.setVolume(v);
      }
      S_utils.setCookie('volume', v);

      $rootScope.$broadcast('volumeChanged', v);
    }

    service.setProgress = function(p) {
      p = +p;
      if (p < 0) {
        p = 0;
      }

      if (p > 100) {
        p = 100;
      }


      if (currentSound) {
        currentSound.setPosition(currentSound.durationEstimate * p / 100);
      }

      $rootScope.$broadcast('progressChanged', currentSound);
    }

    service.togglePause = function() {
      if (currentSound) {
        currentSound.togglePause();
        return true;
      }
      return false;
    }

    service.pause = function() {
      if (currentSound) {
        currentSound.pause();
      }
    }

    service.create = function(info, onfinish) {
      var id = info.aid;
      var url = info.url;


      service.stopAll();
      if (currentSound && currentSound.loaded) {
        currentSound.unload();
      }
      currentSound = soundManager.createSound({
        id: id,
        url: url,
        volume: volume,
        onfinish: function() {
          if (typeof onfinish === 'function') {
            onfinish();
          }
        },
        onload: function() {
          $rootScope.$broadcast('progressCalculated', this);
        },
        whileplaying: function() {
          if (this.duration != null) {
            $rootScope.$broadcast('progressChanged', this);
          }
        },
        onplay: function() {
          $rootScope.$broadcast('playStateChanged', true);

          /*
          var set = Settings.get();

          if (!Settings.flags.windowFocused && set.notifications) {
            var myNotification = new Notify('Сейчас играет...', {
              body: info.artist + ' - ' + info.title + '',
              timeout: 5,
              icon: '/static/images/music.png',
              notifyClick: function() {
                $('#next').trigger('click');
                myNotification.close();
              }
            });
            myNotification.show();
          }
          */
        },
        onresume: function() {
          $rootScope.$broadcast('playStateChanged', true);
        },
        onpause: function() {
          $rootScope.$broadcast('playStateChanged', false);
        }
      });
      return currentSound;
    }

    service.stopAll = function() {
      soundManager.stopAll();
    }

    service.getMemory = function() {
      var mbUsed = (soundManager.getMemoryUse() / 1024 / 1024).toFixed(2);
      return mbUsed;
    }

    service.createAndPlay = function(q, onerror, onfinish) {

      var sound = service.create(q, onfinish);

      sound.play();

      currentSoundId = q.id;

      S_enviroment.setTitle(q.artist + ' – ' + q.title);
      setTimeout(function() {
        var sound = service.getSound();
        if (sound.sID !== q.id) {
          return;
        }

        if (sound.bytesLoaded === null) {
          if (typeof onerror === 'function') {
            onerror();
          }
        }
      }, 10000);

      $rootScope.$broadcast('trackStarted', q);
    }

    return service;
  }]);
