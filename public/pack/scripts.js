var App = angular.module('App', [
  'ui.router',
  'ui.bootstrap',
  'templates'
]);

App
  .constant('__vkAppId', 4468735)
  .constant('__echonest', {
    key: 'JPIQUINIHEVVTYYRU',
    url: 'http://developer.echonest.com/api/v4/'
  })
  .constant('__lastfm', {
    url: 'http://ws.audioscrobbler.com/2.0/',
    keys: {
      "api": "3b716084894fd83886ebe8a20df6bdf0",
      "secret": "abda2711d758f43cbbede5942541f97f"
    }
  })
  .constant('__api',{
    url: 'http://api.playaaa.dev:8080',
    paths: {
      translationTrackMp3: '/track/translate/',
      getTrackTranslationData: '/track/getData/',
      getTopArtists: '/artists/top'
    }
  })

angular.module('App')
  .filter('toGIS', function() {
    return function(input) {
      if (!input) {
        return '';
      }
      var ss = "",
        mm = '';
      var mss = input;
      mss = Math.round(mss);
      sec = mss % 60;
      min = Math.floor(mss / 60);
      if (sec < 10)
        ss = "0";
      if (min < 10)
        mm = "0";
      return mm + min + ":" + ss + sec;
    };
  })
  .filter('formatBitrate', function() {
    return function(br) {
      var q = '';
      if (br < 128)
        q = '< 128';
      if (br >= 128 && br < 180)
        q = '128';
      if (br >= 180 && br < 240)
        q = '192';
      if (br >= 240 && br < 300)
        q = '256';
      if (br >= 300)
        q = '320';
      return q + ' кбит/с';
    };
  });

App.config([
  '$stateProvider', 
  '$urlRouterProvider', 
  '$locationProvider', 
  '$httpProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf8';

    $locationProvider.html5Mode(true).hashPrefix('!');

    $urlRouterProvider.otherwise("/discover");

    $stateProvider
      .state('discover', {
        url: "/discover/?q",
        controller: 'C_discover as ctr',
        templateUrl: "templates/views/discover/index.html"
      })
      .state('artists', {
        url: "/artists/",
        controller: 'C_artists as ctr',
        templateUrl: "templates/views/artists/index.html"
      })
      .state('artistpage', {
        url: "/artists/:artist",
        controller: 'C_artists.page as ctr',
        templateUrl: "templates/views/artists/page.html"
      })
      .state('flow', {
        url: "/flow/?artist&tag",
        controller: 'C_flow as ctr',
        templateUrl: "templates/views/flow/index.html", 
        reloadOnSearch: false
      })
      .state('playlists', {
        url: "/playlists/",
        controller: 'C_playlists as ctr',
        templateUrl: "templates/views/playlists/index.html", 
        reloadOnSearch: false
      })
      .state('share', {
        url: "/share/:type/:id",
        controller: 'C_share',
        templateUrl: "templates/views/share/index.html"
      })
      .state('album', {
        url: "/album/:artist/:albumName",
        controller: 'C_album as ctr',
        templateUrl: "templates/views/album/index.html"
      })
  }
]);

App.run(['$rootScope','PS_lastfm','S_sound','PS_vk',
  function($rootScope, PS_lastfm, S_sound, PS_vk) {
    $rootScope.$on('$stateChangeStart', function() {
      $rootScope.status = 'loading';
    });
  
    PS_vk.init();
    PS_vk.intro();
    S_sound.init();
  }
]);
angular.module('App').controller('C_controlPanel', ['$scope', '$http', 'S_sound', function($scope, $http, S_sound) {
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
    $scope.$apply(function() {
      ctr.totalTime = q.duration;
      ctr.artist = q.artist;
      ctr.title = q.title;
    });
  });

  ctr.title="asdsad";
  ctr.pause = function() {
    S_sound.togglePause();
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
    $scope.progress = progress;
    S_sound.setProgress(progress);
  }

  function setVolume(event) {
    var volume = getPercent(event);
    $scope.volume = volume;
    S_sound.setVolume(volume);
  }



  ctr.play = function() {
    S_sound.togglePause();
  }


  function collect() {
    var playingTrack = $('.playing').closest('.ng-scope');
    var parent = playingTrack.closest('.tracks');
    var tracks = parent.children();
    return {
      tracks: tracks,
      length: tracks.length,
      index: playingTrack.index()
    }
  }

  ctr.next = function() {
    var c = collect();
    setTimeout(function() {
      if (c.index + 1 >= c.length) {
        c.tracks.eq(0).find('.track').trigger('click');
      } else {
        c.tracks.eq(c.index + 1).find('.track').trigger('click');
      }
    }, 0);
  }
  ctr.prev = function() {
    var c = collect();
    setTimeout(function() {
      if (c.index === 0) {
        c.tracks.eq(c.length - 1).find('.track').trigger('click');
      } else {
        c.tracks.eq(c.index - 1).find('.track').trigger('click');
      }
    }, 0);
  }

  return ctr;
}]);

angular.module('App').controller('C_header', ['$state','PS_lastfm', function($state, PS_lastfm) {
  var ctr = this;

  ctr.search = function(q){
    PS_lastfm.artist.getInfo(q).then(function(resp){
      if (!resp.data.artist || resp.data.artist.stats.listeners < 100 || resp.data.artist.name.toLowerCase() != q.toLowerCase()){
        $state.go('^.discover',{q:q});
      } else {
        $state.go('artistpage',{artist:resp.data.artist.name});
      }
    });   
  }

  return ctr;
}]);
  
angular.module('App').controller('C_intro', ['$state', '$scope', '$timeout', 'PS_vk', function($state, $scope, $timeout, PS_vk) {
  var ctr = this;

  $scope.$on('userLogin', function(event, info) {

    $scope.$apply(function() {
      ctr.userName = info.name;
      $timeout(function() {
        ctr.hideIntro = true;
        $timeout(function() {
          ctr.removeIntro = true;
        }, 550);
      }, 2000);
    });

  });

  $scope.$on('badAuthorization', function(event, info) {
    $scope.$apply(function() {
      ctr.needAuth = true;
    });
  });

  ctr.authorize = function() {
    PS_vk.authorize();
    ctr.needAuth = false;
  }

  return ctr;
}]);

angular.module('App')
  .directive('albumImage', [function() {
    return {
      scope:{
        info: '='
      },
      templateUrl: 'templates/directives/albumImage.html'
    }
  }]);

angular.module('App')
  .directive('minutesScaler', [function() {
    return {
      scope: {
        duration: '='
      },
      templateUrl: 'templates/directives/minutesScaler.html',
      link: function($scope, $element) {

        $scope.$watch('duration', function(duration) {
          if (!duration) {
            return;
          }
          $element.html('');
          var w = $element[0].offsetWidth;

          var minutes = duration / 60;
          var pixelsOnMinute = w / minutes;
          var iterations = Math.ceil(minutes);

          for (var i = 0; i < iterations; i++) {
            $element.append('<div class="scale" style="left:' + (i * pixelsOnMinute) + 'px"></div>');
          }
        });
      }
    }
  }]);

angular.module('App')
  .directive('setBgOnLoad', [function() {
    return {
      scope:{ 
        src: '@setBgOnLoad'
      },
      link: function($scope, $element){ 
        var image = new Image();
        image.src = $scope.src; 

        image.onload = function(){

          $element.css({'background-image':'url('+$scope.src+')'}).addClass('active');
        }
      }
    }
  }]);

angular.module('App')
  .directive('track', ['S_sound',function(S_sound) {
    return {
      scope:{
        info: '='
      }, 
      templateUrl: 'templates/directives/track.html',
      link: function($scope, $element){
        $element.on('click',function(){
          S_sound.createAndPlay($scope.info);
        });
      }
    }
  }]);

angular.module('App')
  .service('S_enviroment', [function() {
    var service = {};

    service.setTitle = function(title) {
      document.title = title;
    }

    return service;
  }]);

angular.module('App')
  .service('S_processing', [
    '$rootScope',
    function($rootScope) {
      var service = {};

      service.loading = function() {
        $rootScope.status = 'loading';

      }

      service.ready = function() {
        $rootScope.status = 'ready';
      }

      return service;
    }
  ]);

angular.module('App')
  .service('S_reduce', [
    '$rootScope',
    function($rootScope) {
      var service = {};

      service.normalizeTopTracks = function(array) {
        return _.reduce(array, function(newArray, song) {
          newArray.push({
            artist: song.artist.name,
            title: song.name,
            duration: song.duration
          });
          return newArray;
        }, []);
      }

      service.filterTracks = function(items, allowOptions) {
        allowOptions = angular.extend({
          bigTitles: false,
          withDurations: true
        }, allowOptions || {});

        var filteredItems = [];
        for (var l = items.length, i = 0; i < l; i++) {
          var item = items[i];
          var title = service.clearTrashSymbols(item.title);

          if (!allowOptions.withDurations || (typeof item.duration !== 'undefined' && allowOptions.withDurations)) {
            if (allowOptions.bigTitles || (!allowOptions.bigTitles && item.title.length < 50)) {
              item.title = title;
              item.artist = service.clearTrashSymbols(item.artist);
              filteredItems.push(item);
            }
          }
        };

        return filteredItems;
      }

      service.clearTrashSymbols = function(text) {
        var filt = ["♫", "►", "=", "♥", " ]", "★", "™", "║", "●", "✖"];
        text = text.replace(new RegExp("[0-9]+[.]", 'g'), "");
        text = text.replace(new RegExp("^[0-9]+[ ]", 'g'), "");
        text = text.replace(new RegExp("[(][0-9]+[)]", 'g'), "");
        text = text.replace(new RegExp("[(][.]+[)]", 'g'), "");
        text = text.replace(new RegExp("www.[0-9^ ]*", 'g'), "");
        text = text.replace(new RegExp("club[^ ]*", 'g'), "");
        text = text.replace(new RegExp("ё", 'g'), "е");
        text = text.replace(/([^ ]*\.ru)/g, "");
        text = text.replace(/\[[^]*\]/g, "");

        for (var k = 0; k < filt.length; k++)
          text = text.replace(new RegExp(filt[k], 'g'), "");
        return text;
      }

      return service;
    }
  ]);

angular.module('App')
  .service('S_sound', ['$rootScope','S_utils','S_enviroment',function($rootScope, S_utils, S_enviroment) {


    var service = {};

    var currentSound;

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

      //$rootScope.$broadcast('volumeChanged', v);
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
      if (currentSound) {
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
      S_enviroment.setTitle(q.artist + ' – ' + q.title);
      setTimeout(function() {
        var sound = Sound.getSound();
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

angular.module('App')
  .service('S_utils', [function() {
    var service = {};
    var Base64 = {


      // private property
      _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

      // public method for encoding
      encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }

          output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
      },

      // public method for decoding
      decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

          enc1 = this._keyStr.indexOf(input.charAt(i++));
          enc2 = this._keyStr.indexOf(input.charAt(i++));
          enc3 = this._keyStr.indexOf(input.charAt(i++));
          enc4 = this._keyStr.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          output = output + String.fromCharCode(chr1);

          if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
          }
          if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
          }

        }

        output = Base64._utf8_decode(output);

        return output;

      },

      // private method for UTF-8 encoding
      _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

          var c = string.charCodeAt(n);

          if (c < 128) {
            utftext += String.fromCharCode(c);
          } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
          } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
          }

        }

        return utftext;
      },

      // private method for UTF-8 decoding
      _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

          c = utftext.charCodeAt(i);

          if (c < 128) {
            string += String.fromCharCode(c);
            i++;
          } else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
          } else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
          }

        }

        return string;
      }

    }


    service.setCookie = function(name, value, days) {
      var expires;
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      } else {
        expires = "";
      }
      document.cookie = name + "=" + value + expires + "; path=/";
    }

    service.getCookie = function(c_name) {
      if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
          c_start = c_start + c_name.length + 1;
          c_end = document.cookie.indexOf(";", c_start);
          if (c_end == -1) {
            c_end = document.cookie.length;
          }
          return unescape(document.cookie.substring(c_start, c_end));
        }
      }
      return "";
    }


    function getExtension(q) {
      return q.split('.').pop()
    }

    



    service.shuffleArray = function(array) {
      var currentIndex = array.length,
        temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }



    var addEvent = (function() {
      if (document.addEventListener) {
        return function(el, type, fn) {
          if (el && el.nodeName || el === window) {
            el.addEventListener(type, fn, false);
          } else if (el && el.length) {
            for (var i = 0; i < el.length; i++) {
              addEvent(el[i], type, fn);
            }
          }
        };
      } else {
        return function(el, type, fn) {
          if (el && el.nodeName || el === window) {
            el.attachEvent('on' + type, function() {
              return fn.call(el, window.event);
            });
          } else if (el && el.length) {
            for (var i = 0; i < el.length; i++) {
              addEvent(el[i], type, fn);
            }
          }
        };
      }
    })();


    function getCode(f, vars) {
      var entire = f.toString();
      var body = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));

      var varstr = '';
      if (typeof vars === 'object') {
        for (i in vars) {
          varstr += 'var ' + i + ' = ' + vars[i] + ';';
        }
      }

      return varstr + body;
    }



    return service;
  }]);

function LastFM(options){
	var apiKey    = options.apiKey    || '';
	var apiSecret = options.apiSecret || '';
	var apiUrl    = options.apiUrl    || 'http://ws.audioscrobbler.com/2.0/';
	var cache     = options.cache     || undefined;

	this.setApiKey = function(_apiKey){
		apiKey = _apiKey;
	};

	this.setApiSecret = function(_apiSecret){
		apiSecret = _apiSecret;
	};

	this.setApiUrl = function(_apiUrl){
		apiUrl = _apiUrl;
	};

	this.setCache = function(_cache){
		cache = _cache;
	};

	var internalCall = function(params, callbacks, requestMethod){
		if(requestMethod == 'POST'){
			/* Create iframe element to post data. */
			
			iframes = document.getElementsByClassName('ifr'); 
			
			var html   = document.getElementsByTagName('html')[0];
			for (i=0; i<(iframes.length); i++){
				html.removeChild(iframes[i]);
			}
			//alert(iframes.length);
			
			
			var iframe = document.createElement('iframe');
			var doc;

			/* Set iframe attributes. */
			iframe.width        = 1;
			iframe.height       = 1;
iframe.className       = "ifr";
			iframe.style.border = 'none';
			iframe.onload       = function(){
				/* Remove iframe element. */
				//html.removeChild(iframe);

				/* Call user callback. */
				if(typeof(callbacks.success) != 'undefined'){
					callbacks.success();
					
					
				}
			};

			/* Append iframe. */
			html.appendChild(iframe);

			/* Get iframe document. */
			if(typeof(iframe.contentWindow) != 'undefined'){
				doc = iframe.contentWindow.document;
			}
			else if(typeof(iframe.contentDocument.document) != 'undefined'){
				doc = iframe.contentDocument.document.document;
			}
			else{
				doc = iframe.contentDocument.document;
			}

			/* Open iframe document and write a form. */
			doc.open();
			doc.clear();
			doc.write('<form method="post" action="' + apiUrl + '" id="form">');

			/* Write POST parameters as input fields. */
			for(var param in params){
				doc.write('<input type="text" name="' + param + '" value="' + params[param] + '">');
			}

			/* Write automatic form submission code. */
			doc.write('</form>');
			doc.write('<script type="text/javascript">');
			doc.write('document.getElementById("form").submit();');
			doc.write('</script>');

			/* Close iframe document. */
			doc.close();
			
		}
		/* Cross-domain GET request (JSONP). */
		else {
			/* Get JSONP callback name. */
			var jsonp = 'jsonp' + new Date().getTime();

			/* Calculate cache hash. */
			var hash = auth.getApiSignature(params);
			/* Check cache. */
			if(typeof(cache) != 'undefined' && cache.contains(hash) && !cache.isExpired(hash)){
				if(typeof(callbacks.success) != 'undefined'){
					callbacks.success(cache.load(hash));
				}

				return;
			}

			/* Set callback name and response format. */
			params.callback = jsonp;
			params.format   = 'json';

			/* Create JSONP callback function. */
			window[jsonp] = function(data){
				/* Is a cache available?. */
				if(typeof(cache) != 'undefined'){
					var expiration = cache.getExpirationTime(params);

					if(expiration > 0){
						cache.store(hash, data, expiration);
					}
				}

				/* Call user callback. */
				if(typeof(data.error) != 'undefined'){
					if(typeof(callbacks.error) != 'undefined'){
						callbacks.error(data.error, data.message);
					}
				}
				else if(typeof(callbacks.success) != 'undefined'){
					callbacks.success(data);
				}

				/* Garbage collect. */
				window[jsonp] = undefined;

				try{
					delete window[jsonp];
				}
				catch(e){
					/* Nothing. */
				}

				/* Remove script element. */
				if(head){
					head.removeChild(script);
				}
			};

			/* Create script element to load JSON data. */
			var head   = document.getElementsByTagName("head")[0];
			var script = document.createElement("script");

			/* Build parameter string. */
			var array = [];

			for(var param in params){
				array.push(encodeURIComponent(param) + "=" + encodeURIComponent(params[param]));
			}

			/* Set script source. */
			script.src = apiUrl + '?' + array.join('&').replace(/%20/g, '+');

			/* Append script element. */
			head.appendChild(script);
		}
	};

	/* Normal method call. */
	var call = function(method, params, callbacks, requestMethod){
		/* Set default values. */
		params        = params        || {};
		callbacks     = callbacks     || {};
		requestMethod = requestMethod || 'GET';

		/* Add parameters. */
		params.method  = method;
		params.api_key = apiKey;

		/* Call method. */
		internalCall(params, callbacks, requestMethod);
	};

	/* Signed method call. */
	var signedCall = function(method, params, session, callbacks, requestMethod){
		/* Set default values. */
		params        = params        || {};
		callbacks     = callbacks     || {};
		requestMethod = requestMethod || 'GET';

		/* Add parameters. */
		params.method  = method;
		params.api_key = apiKey;

		/* Add session key. */
	//	if(session && typeof(session.key) != 'undefined'){
			params.sk = P.lastkey;
	//	}

		/* Get API signature. */
		params.api_sig = auth.getApiSignature(params);

		/* Call method. */
		internalCall(params, callbacks, requestMethod);
	};

	/* Album methods. */
	this.album = {
		addTags : function(params, session, callbacks){
			/* Build comma separated tags string. */
			if(typeof(params.tags) == 'object'){
				params.tags = params.tags.join(',');
			}

			signedCall('album.addTags', params, session, callbacks, 'POST');
		},

		getBuylinks : function(params, callbacks){
			call('album.getBuylinks', params, callbacks);
		},

		getInfo : function(params, callbacks){
			call('album.getInfo', params, callbacks);
		},

		getTags : function(params, session, callbacks){
			signedCall('album.getTags', params, session, callbacks);
		},

		removeTag : function(params, session, callbacks){
			signedCall('album.removeTag', params, session, callbacks, 'POST');
		},

		search : function(params, callbacks){
			call('album.search', params, callbacks);
		},

		share : function(params, session, callbacks){
			/* Build comma separated recipients string. */
			if(typeof(params.recipient) == 'object'){
				params.recipient = params.recipient.join(',');
			}

			signedCall('album.share', params, callbacks);
		}
	};

	/* Artist methods. */
	this.artist = {
		addTags : function(params, session, callbacks){
			/* Build comma separated tags string. */
			if(typeof(params.tags) == 'object'){
				params.tags = params.tags.join(',');
			}

			signedCall('artist.addTags', params, session, callbacks, 'POST');
		},

		getCorrection : function(params, callbacks){
			call('artist.getCorrection', params, callbacks);
		},

		getEvents : function(params, callbacks){
			call('artist.getEvents', params, callbacks);
		},

		getImages : function(params, callbacks){
			call('artist.getImages', params, callbacks);
		},

		getInfo : function(params, callbacks){
			call('artist.getInfo', params, callbacks);
		},

		getPastEvents : function(params, callbacks){
			call('artist.getPastEvents', params, callbacks);
		},

		getPodcast : function(params, callbacks){
			call('artist.getPodcast', params, callbacks);
		},

		getShouts : function(params, callbacks){
			call('artist.getShouts', params, callbacks);
		},

		getSimilar : function(params, callbacks){
			call('artist.getSimilar', params, callbacks);
		},

		getTags : function(params, session, callbacks){
			signedCall('artist.getTags', params, session, callbacks);
		},

		getTopAlbums : function(params, callbacks){
			call('artist.getTopAlbums', params, callbacks);
		},

		getTopFans : function(params, callbacks){
			call('artist.getTopFans', params, callbacks);
		},

		getTopTags : function(params, callbacks){
			call('artist.getTopTags', params, callbacks);
		},

		getTopTracks : function(params, callbacks){
			call('artist.getTopTracks', params, callbacks);
		},

		removeTag : function(params, session, callbacks){
			signedCall('artist.removeTag', params, session, callbacks, 'POST');
		},

		search : function(params, callbacks){
			call('artist.search', params, callbacks);
		},

		share : function(params, session, callbacks){
			/* Build comma separated recipients string. */
			if(typeof(params.recipient) == 'object'){
				params.recipient = params.recipient.join(',');
			}

			signedCall('artist.share', params, session, callbacks, 'POST');
		},

		shout : function(params, session, callbacks){
			signedCall('artist.shout', params, session, callbacks, 'POST');
		}
	};

	/* Auth methods. */
	this.auth = {
		getMobileSession : function(params, callbacks){
			/* Set new params object with authToken. */
			params = {
				username  : params.username,
				authToken : hex_md5(params.username + hex_md5(params.password))
			};

			signedCall('auth.getMobileSession', params, null, callbacks);
		},

		getSession : function(params, callbacks){
			signedCall('auth.getSession', params, null, callbacks);
		},

		getToken : function(callbacks){
			signedCall('auth.getToken', null, null, callbacks);
		},

		/* Deprecated. Security hole was fixed. */
		getWebSession : function(callbacks){
			/* Save API URL and set new one (needs to be done due to a cookie!). */
			var previuousApiUrl = apiUrl;

			apiUrl = 'http://ext.last.fm/2.0/';

			signedCall('auth.getWebSession', null, null, callbacks);

			/* Restore API URL. */
			apiUrl = previuousApiUrl;
		}
	};

	/* Chart methods. */
	this.chart = {
		getHypedArtists : function(params, callbacks){
			call('chart.getHypedArtists', params, callbacks);
		},

		getHypedTracks : function(params, session, callbacks){
			call('chart.getHypedTracks', params, callbacks);
		},

		getLovedTracks : function(params, session, callbacks){
			call('chart.getLovedTracks', params, callbacks);
		},

		getTopArtists : function(params, callbacks){
			call('chart.getTopArtists', params, callbacks);
		},

		getTopTags : function(params, session, callbacks){
			call('chart.getTopTags', params, callbacks);
		},

		getTopTracks : function(params, session, callbacks){
			call('chart.getTopTracks', params, callbacks);
		}
	};

	/* Event methods. */
	this.event = {
		attend : function(params, session, callbacks){
			signedCall('event.attend', params, session, callbacks, 'POST');
		},

		getAttendees : function(params, session, callbacks){
			call('event.getAttendees', params, callbacks);
		},

		getInfo : function(params, callbacks){
			call('event.getInfo', params, callbacks);
		},

		getShouts : function(params, callbacks){
			call('event.getShouts', params, callbacks);
		},

		share : function(params, session, callbacks){
			/* Build comma separated recipients string. */
			if(typeof(params.recipient) == 'object'){
				params.recipient = params.recipient.join(',');
			}

			signedCall('event.share', params, session, callbacks, 'POST');
		},

		shout : function(params, session, callbacks){
			signedCall('event.shout', params, session, callbacks, 'POST');
		}
	};

	/* Geo methods. */
	this.geo = {
		getEvents : function(params, callbacks){
			call('geo.getEvents', params, callbacks);
		},

		getMetroArtistChart : function(params, callbacks){
			call('geo.getMetroArtistChart', params, callbacks);
		},

		getMetroHypeArtistChart : function(params, callbacks){
			call('geo.getMetroHypeArtistChart', params, callbacks);
		},

		getMetroHypeTrackChart : function(params, callbacks){
			call('geo.getMetroHypeTrackChart', params, callbacks);
		},

		getMetroTrackChart : function(params, callbacks){
			call('geo.getMetroTrackChart', params, callbacks);
		},

		getMetroUniqueArtistChart : function(params, callbacks){
			call('geo.getMetroUniqueArtistChart', params, callbacks);
		},

		getMetroUniqueTrackChart : function(params, callbacks){
			call('geo.getMetroUniqueTrackChart', params, callbacks);
		},

		getMetroWeeklyChartlist : function(params, callbacks){
			call('geo.getMetroWeeklyChartlist', params, callbacks);
		},

		getMetros : function(params, callbacks){
			call('geo.getMetros', params, callbacks);
		},

		getTopArtists : function(params, callbacks){
			call('geo.getTopArtists', params, callbacks);
		},

		getTopTracks : function(params, callbacks){
			call('geo.getTopTracks', params, callbacks);
		}
	};

	/* Group methods. */
	this.group = {
		getHype : function(params, callbacks){
			call('group.getHype', params, callbacks);
		},

		getMembers : function(params, callbacks){
			call('group.getMembers', params, callbacks);
		},

		getWeeklyAlbumChart : function(params, callbacks){
			call('group.getWeeklyAlbumChart', params, callbacks);
		},

		getWeeklyArtistChart : function(params, callbacks){
			call('group.getWeeklyArtistChart', params, callbacks);
		},

		getWeeklyChartList : function(params, callbacks){
			call('group.getWeeklyChartList', params, callbacks);
		},

		getWeeklyTrackChart : function(params, callbacks){
			call('group.getWeeklyTrackChart', params, callbacks);
		}
	};

	/* Library methods. */
	this.library = {
		addAlbum : function(params, session, callbacks){
			signedCall('library.addAlbum', params, session, callbacks, 'POST');
		},

		addArtist : function(params, session, callbacks){
			signedCall('library.addArtist', params, session, callbacks, 'POST');
		},

		addTrack : function(params, session, callbacks){
			signedCall('library.addTrack', params, session, callbacks, 'POST');
		},

		getAlbums : function(params, callbacks){
			call('library.getAlbums', params, callbacks);
		},

		getArtists : function(params, callbacks){
			call('library.getArtists', params, callbacks);
		},

		getTracks : function(params, callbacks){
			call('library.getTracks', params, callbacks);
		}
	};

	/* Playlist methods. */
	this.playlist = {
		addTrack : function(params, session, callbacks){
			signedCall('playlist.addTrack', params, session, callbacks, 'POST');
		},

		create : function(params, session, callbacks){
			signedCall('playlist.create', params, session, callbacks, 'POST');
		},

		fetch : function(params, callbacks){
			call('playlist.fetch', params, callbacks);
		}
	};

	/* Radio methods. */
	this.radio = {
		getPlaylist : function(params, session, callbacks){
			signedCall('radio.getPlaylist', params, session, callbacks);
		},

		search : function(params, session, callbacks){
			signedCall('radio.search', params, session, callbacks);
		},

		tune : function(params, session, callbacks){
			signedCall('radio.tune', params, session, callbacks);
		}
	};

	/* Tag methods. */
	this.tag = {
		getInfo : function(params, callbacks){
			call('tag.getInfo', params, callbacks);
		},

		getSimilar : function(params, callbacks){
			call('tag.getSimilar', params, callbacks);
		},

		getTopAlbums : function(params, callbacks){
			call('tag.getTopAlbums', params, callbacks);
		},

		getTopArtists : function(params, callbacks){
			call('tag.getTopArtists', params, callbacks);
		},

		getTopTags : function(callbacks){
			call('tag.getTopTags', null, callbacks);
		},

		getTopTracks : function(params, callbacks){
			call('tag.getTopTracks', params, callbacks);
		},

		getWeeklyArtistChart : function(params, callbacks){
			call('tag.getWeeklyArtistChart', params, callbacks);
		},

		getWeeklyChartList : function(params, callbacks){
			call('tag.getWeeklyChartList', params, callbacks);
		},

		search : function(params, callbacks){
			call('tag.search', params, callbacks);
		}
	};

	/* Tasteometer method. */
	this.tasteometer = {
		compare : function(params, callbacks){
			call('tasteometer.compare', params, callbacks);
		},

		compareGroup : function(params, callbacks){
			call('tasteometer.compareGroup', params, callbacks);
		}
	};
this.track = {
		addTags : function(params, session, callbacks){
			signedCall('track.addTags', params, session, callbacks, 'POST');
		},

		ban : function(params, session, callbacks){
			signedCall('track.ban', params, session, callbacks, 'POST');
		},

		getBuylinks : function(params, callbacks){
			call('track.getBuylinks', params, callbacks);
		},

		getCorrection : function(params, callbacks){
			call('track.getCorrection', params, callbacks);
		},

		getFingerprintMetadata : function(params, callbacks){
			call('track.getFingerprintMetadata', params, callbacks);
		},

		getInfo : function(params, callbacks){
			call('track.getInfo', params, callbacks);
		},

		getShouts : function(params, callbacks){
			call('track.getShouts', params, callbacks);
		},

		getSimilar : function(params, callbacks){
			call('track.getSimilar', params, callbacks);
		},

		getTags : function(params, session, callbacks){
			signedCall('track.getTags', params, session, callbacks);
		},

		getTopFans : function(params, callbacks){
			call('track.getTopFans', params, callbacks);
		},

		getTopTags : function(params, callbacks){
			call('track.getTopTags', params, callbacks);
		},

		love : function(params, session, callbacks){
			signedCall('track.love', params, session, callbacks, 'POST');
		},

		removeTag : function(params, session, callbacks){
			signedCall('track.removeTag', params, session, callbacks, 'POST');
		},

		scrobble : function(params, session, callbacks){
			/* Flatten an array of multiple tracks into an object with "array notation". */
			if(params.constructor.toString().indexOf("Array") != -1){
				var p = {};

				for(i in params){
					for(j in params[i]){
						p[j + '[' + i + ']'] = params[i][j];
					}
				}

				params = p;
			}

			signedCall('track.scrobble', params, session, callbacks, 'POST');
		},

		search : function(params, callbacks){
			call('track.search', params, callbacks);
		},

		share : function(params, session, callbacks){
			/* Build comma separated recipients string. */
			if(typeof(params.recipient) == 'object'){
				params.recipient = params.recipient.join(',');
			}

			signedCall('track.share', params, session, callbacks, 'POST');
		},

		unban : function(params, session, callbacks){
			signedCall('track.unban', params, session, callbacks, 'POST');
		},

		unlove : function(params, session, callbacks){
			signedCall('track.unlove', params, session, callbacks, 'POST');
		},

		updateNowPlaying : function(params, session, callbacks){
			signedCall('track.updateNowPlaying', params, session, callbacks, 'POST');
		}
	};

	/* User methods. */
	this.user = {
		getArtistTracks : function(params, callbacks){
			call('user.getArtistTracks', params, callbacks);
		},

		getBannedTracks : function(params, callbacks){
			call('user.getBannedTracks', params, callbacks);
		},

		getEvents : function(params, callbacks){
			call('user.getEvents', params, callbacks);
		},

		getFriends : function(params, callbacks){
			call('user.getFriends', params, callbacks);
		},

		getInfo : function(params, callbacks){
			call('user.getInfo', params, callbacks);
		},

		getLovedTracks : function(params, callbacks){
			call('user.getLovedTracks', params, callbacks);
		},

		getNeighbours : function(params, callbacks){
			call('user.getNeighbours', params, callbacks);
		},

		getNewReleases : function(params, callbacks){
			call('user.getNewReleases', params, callbacks);
		},

		getPastEvents : function(params, callbacks){
			call('user.getPastEvents', params, callbacks);
		},

		getPersonalTracks : function(params, callbacks){
			call('user.getPersonalTracks', params, callbacks);
		},

		getPlaylists : function(params, callbacks){
			call('user.getPlaylists', params, callbacks);
		},

		getRecentStations : function(params, session, callbacks){
			signedCall('user.getRecentStations', params, session, callbacks);
		},

		getRecentTracks : function(params, callbacks){
			call('user.getRecentTracks', params, callbacks);
		},

		getRecommendedArtists : function(params, session, callbacks){
			signedCall('user.getRecommendedArtists', params, session, callbacks);
		},

		getRecommendedEvents : function(params, session, callbacks){
			signedCall('user.getRecommendedEvents', params, session, callbacks);
		},

		getShouts : function(params, callbacks){
			call('user.getShouts', params, callbacks);
		},

		getTopAlbums : function(params, callbacks){
			call('user.getTopAlbums', params, callbacks);
		},

		getTopArtists : function(params, callbacks){
			call('user.getTopArtists', params, callbacks);
		},

		getTopTags : function(params, callbacks){
			call('user.getTopTags', params, callbacks);
		},

		getTopTracks : function(params, callbacks){
			call('user.getTopTracks', params, callbacks);
		},

		getWeeklyAlbumChart : function(params, callbacks){
			call('user.getWeeklyAlbumChart', params, callbacks);
		},

		getWeeklyArtistChart : function(params, callbacks){
			call('user.getWeeklyArtistChart', params, callbacks);
		},

		getWeeklyChartList : function(params, callbacks){
			call('user.getWeeklyChartList', params, callbacks);
		},

		getWeeklyTrackChart : function(params, callbacks){
			call('user.getWeeklyTrackChart', params, callbacks);
		},

		shout : function(params, session, callbacks){
			signedCall('user.shout', params, session, callbacks, 'POST');
		}
	};

	/* Venue methods. */
	this.venue = {
		getEvents : function(params, callbacks){
			call('venue.getEvents', params, callbacks);
		},

		getPastEvents : function(params, callbacks){
			call('venue.getPastEvents', params, callbacks);
		},

		search : function(params, callbacks){
			call('venue.search', params, callbacks);
		}
	};

	/* Private auth methods. */
	var auth = {
		getApiSignature : function(params){
			var keys   = [];
			var string = '';

			for(var key in params){
				keys.push(key);
			}

			keys.sort();

			for(var index in keys){

				var key = keys[index];

				string += key + params[key];
			}

			string += apiSecret;

			return hex_md5(string);
		}
	};
}
var hexcase=0;function hex_md5(a){return rstr2hex(rstr_md5(str2rstr_utf8(a)))}function hex_hmac_md5(a,b){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a),str2rstr_utf8(b)))}function md5_vm_test(){return hex_md5("abc").toLowerCase()=="900150983cd24fb0d6963f7d28e17f72"}function rstr_md5(a){return binl2rstr(binl_md5(rstr2binl(a),a.length*8))}function rstr_hmac_md5(c,f){var e=rstr2binl(c);if(e.length>16){e=binl_md5(e,c.length*8)}var a=Array(16),d=Array(16);for(var b=0;b<16;b++){a[b]=e[b]^909522486;d[b]=e[b]^1549556828}var g=binl_md5(a.concat(rstr2binl(f)),512+f.length*8);return binl2rstr(binl_md5(d.concat(g),512+128))}function rstr2hex(c){try{hexcase}catch(g){hexcase=0}var f=hexcase?"0123456789ABCDEF":"0123456789abcdef";var b="";var a;for(var d=0;d<c.length;d++){a=c.charCodeAt(d);b+=f.charAt((a>>>4)&15)+f.charAt(a&15)}return b}function str2rstr_utf8(c){var b="";var d=-1;var a,e;while(++d<c.length){a=c.charCodeAt(d);e=d+1<c.length?c.charCodeAt(d+1):0;if(55296<=a&&a<=56319&&56320<=e&&e<=57343){a=65536+((a&1023)<<10)+(e&1023);d++}if(a<=127){b+=String.fromCharCode(a)}else{if(a<=2047){b+=String.fromCharCode(192|((a>>>6)&31),128|(a&63))}else{if(a<=65535){b+=String.fromCharCode(224|((a>>>12)&15),128|((a>>>6)&63),128|(a&63))}else{if(a<=2097151){b+=String.fromCharCode(240|((a>>>18)&7),128|((a>>>12)&63),128|((a>>>6)&63),128|(a&63))}}}}}return b}function rstr2binl(b){var a=Array(b.length>>2);for(var c=0;c<a.length;c++){a[c]=0}for(var c=0;c<b.length*8;c+=8){a[c>>5]|=(b.charCodeAt(c/8)&255)<<(c%32)}return a}function binl2rstr(b){var a="";for(var c=0;c<b.length*32;c+=8){a+=String.fromCharCode((b[c>>5]>>>(c%32))&255)}return a}function binl_md5(p,k){p[k>>5]|=128<<((k)%32);p[(((k+64)>>>9)<<4)+14]=k;var o=1732584193;var n=-271733879;var m=-1732584194;var l=271733878;for(var g=0;g<p.length;g+=16){var j=o;var h=n;var f=m;var e=l;o=md5_ff(o,n,m,l,p[g+0],7,-680876936);l=md5_ff(l,o,n,m,p[g+1],12,-389564586);m=md5_ff(m,l,o,n,p[g+2],17,606105819);n=md5_ff(n,m,l,o,p[g+3],22,-1044525330);o=md5_ff(o,n,m,l,p[g+4],7,-176418897);l=md5_ff(l,o,n,m,p[g+5],12,1200080426);m=md5_ff(m,l,o,n,p[g+6],17,-1473231341);n=md5_ff(n,m,l,o,p[g+7],22,-45705983);o=md5_ff(o,n,m,l,p[g+8],7,1770035416);l=md5_ff(l,o,n,m,p[g+9],12,-1958414417);m=md5_ff(m,l,o,n,p[g+10],17,-42063);n=md5_ff(n,m,l,o,p[g+11],22,-1990404162);o=md5_ff(o,n,m,l,p[g+12],7,1804603682);l=md5_ff(l,o,n,m,p[g+13],12,-40341101);m=md5_ff(m,l,o,n,p[g+14],17,-1502002290);n=md5_ff(n,m,l,o,p[g+15],22,1236535329);o=md5_gg(o,n,m,l,p[g+1],5,-165796510);l=md5_gg(l,o,n,m,p[g+6],9,-1069501632);m=md5_gg(m,l,o,n,p[g+11],14,643717713);n=md5_gg(n,m,l,o,p[g+0],20,-373897302);o=md5_gg(o,n,m,l,p[g+5],5,-701558691);l=md5_gg(l,o,n,m,p[g+10],9,38016083);m=md5_gg(m,l,o,n,p[g+15],14,-660478335);n=md5_gg(n,m,l,o,p[g+4],20,-405537848);o=md5_gg(o,n,m,l,p[g+9],5,568446438);l=md5_gg(l,o,n,m,p[g+14],9,-1019803690);m=md5_gg(m,l,o,n,p[g+3],14,-187363961);n=md5_gg(n,m,l,o,p[g+8],20,1163531501);o=md5_gg(o,n,m,l,p[g+13],5,-1444681467);l=md5_gg(l,o,n,m,p[g+2],9,-51403784);m=md5_gg(m,l,o,n,p[g+7],14,1735328473);n=md5_gg(n,m,l,o,p[g+12],20,-1926607734);o=md5_hh(o,n,m,l,p[g+5],4,-378558);l=md5_hh(l,o,n,m,p[g+8],11,-2022574463);m=md5_hh(m,l,o,n,p[g+11],16,1839030562);n=md5_hh(n,m,l,o,p[g+14],23,-35309556);o=md5_hh(o,n,m,l,p[g+1],4,-1530992060);l=md5_hh(l,o,n,m,p[g+4],11,1272893353);m=md5_hh(m,l,o,n,p[g+7],16,-155497632);n=md5_hh(n,m,l,o,p[g+10],23,-1094730640);o=md5_hh(o,n,m,l,p[g+13],4,681279174);l=md5_hh(l,o,n,m,p[g+0],11,-358537222);m=md5_hh(m,l,o,n,p[g+3],16,-722521979);n=md5_hh(n,m,l,o,p[g+6],23,76029189);o=md5_hh(o,n,m,l,p[g+9],4,-640364487);l=md5_hh(l,o,n,m,p[g+12],11,-421815835);m=md5_hh(m,l,o,n,p[g+15],16,530742520);n=md5_hh(n,m,l,o,p[g+2],23,-995338651);o=md5_ii(o,n,m,l,p[g+0],6,-198630844);l=md5_ii(l,o,n,m,p[g+7],10,1126891415);m=md5_ii(m,l,o,n,p[g+14],15,-1416354905);n=md5_ii(n,m,l,o,p[g+5],21,-57434055);o=md5_ii(o,n,m,l,p[g+12],6,1700485571);l=md5_ii(l,o,n,m,p[g+3],10,-1894986606);m=md5_ii(m,l,o,n,p[g+10],15,-1051523);n=md5_ii(n,m,l,o,p[g+1],21,-2054922799);o=md5_ii(o,n,m,l,p[g+8],6,1873313359);l=md5_ii(l,o,n,m,p[g+15],10,-30611744);m=md5_ii(m,l,o,n,p[g+6],15,-1560198380);n=md5_ii(n,m,l,o,p[g+13],21,1309151649);o=md5_ii(o,n,m,l,p[g+4],6,-145523070);l=md5_ii(l,o,n,m,p[g+11],10,-1120210379);m=md5_ii(m,l,o,n,p[g+2],15,718787259);n=md5_ii(n,m,l,o,p[g+9],21,-343485551);o=safe_add(o,j);n=safe_add(n,h);m=safe_add(m,f);l=safe_add(l,e)}return Array(o,n,m,l)}function md5_cmn(h,e,d,c,g,f){return safe_add(bit_rol(safe_add(safe_add(e,h),safe_add(c,f)),g),d)}function md5_ff(g,f,k,j,e,i,h){return md5_cmn((f&k)|((~f)&j),g,f,e,i,h)}function md5_gg(g,f,k,j,e,i,h){return md5_cmn((f&j)|(k&(~j)),g,f,e,i,h)}function md5_hh(g,f,k,j,e,i,h){return md5_cmn(f^k^j,g,f,e,i,h)}function md5_ii(g,f,k,j,e,i,h){return md5_cmn(k^(f|(~j)),g,f,e,i,h)}function safe_add(a,d){var c=(a&65535)+(d&65535);var b=(a>>16)+(d>>16)+(c>>16);return(b<<16)|(c&65535)}function bit_rol(a,b){return(a<<b)|(a>>>(32-b))};
/** @license
 *
 * SoundManager 2: JavaScript Sound for the Web
 * ----------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License:
 * http://schillmania.com/projects/soundmanager2/license.txt
 *
 * V2.97a.20140901
 */

/*global window, SM2_DEFER, sm2Debugger, console, document, navigator, setTimeout, setInterval, clearInterval, Audio, opera, module, define */
/*jslint regexp: true, sloppy: true, white: true, nomen: true, plusplus: true, todo: true */

(function(window, _undefined) {
"use strict";
if (!window || !window.document) {
  throw new Error('SoundManager requires a browser with window and document objects.');
}
var soundManager = null;
function SoundManager(smURL, smID) {
  this.setupOptions = {
    'url': (smURL || null),
    'flashVersion': 8,
    'debugMode': true,
    'debugFlash': false,
    'useConsole': true,
    'consoleOnly': true,
    'waitForWindowLoad': false,
    'bgColor': '#ffffff',
    'useHighPerformance': false,
    'flashPollingInterval': null,
    'html5PollingInterval': null,
    'flashLoadTimeout': 1000,
    'wmode': null,
    'allowScriptAccess': 'always',
    'useFlashBlock': false,
    'useHTML5Audio': true,
    'html5Test': /^(probably|maybe)$/i,
    'preferFlash': false,
    'noSWFCache': false,
    'idPrefix': 'sound'
  };
  this.defaultOptions = {
    'autoLoad': false,
    'autoPlay': false,
    'from': null,
    'loops': 1,
    'onid3': null,
    'onload': null,
    'whileloading': null,
    'onplay': null,
    'onpause': null,
    'onresume': null,
    'whileplaying': null,
    'onposition': null,
    'onstop': null,
    'onfailure': null,
    'onfinish': null,
    'multiShot': true,
    'multiShotEvents': false,
    'position': null,
    'pan': 0,
    'stream': true,
    'to': null,
    'type': null,
    'usePolicyFile': false,
    'volume': 100
  };
  this.flash9Options = {
    'isMovieStar': null,
    'usePeakData': false,
    'useWaveformData': false,
    'useEQData': false,
    'onbufferchange': null,
    'ondataerror': null
  };
  this.movieStarOptions = {
    'bufferTime': 3,
    'serverURL': null,
    'onconnect': null,
    'duration': null
  };
  this.audioFormats = {
    'mp3': {
      'type': ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust'],
      'required': true
    },
    'mp4': {
      'related': ['aac','m4a','m4b'],
      'type': ['audio/mp4; codecs="mp4a.40.2"', 'audio/aac', 'audio/x-m4a', 'audio/MP4A-LATM', 'audio/mpeg4-generic'],
      'required': false
    },
    'ogg': {
      'type': ['audio/ogg; codecs=vorbis'],
      'required': false
    },
    'opus': {
      'type': ['audio/ogg; codecs=opus', 'audio/opus'],
      'required': false
    },
    'wav': {
      'type': ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav'],
      'required': false
    }
  };
  this.movieID = 'sm2-container';
  this.id = (smID || 'sm2movie');
  this.debugID = 'soundmanager-debug';
  this.debugURLParam = /([#?&])debug=1/i;
  this.versionNumber = 'V2.97a.20140901';
  this.version = null;
  this.movieURL = null;
  this.altURL = null;
  this.swfLoaded = false;
  this.enabled = false;
  this.oMC = null;
  this.sounds = {};
  this.soundIDs = [];
  this.muted = false;
  this.didFlashBlock = false;
  this.filePattern = null;
  this.filePatterns = {
    'flash8': /\.mp3(\?.*)?$/i,
    'flash9': /\.mp3(\?.*)?$/i
  };
  this.features = {
    'buffering': false,
    'peakData': false,
    'waveformData': false,
    'eqData': false,
    'movieStar': false
  };
  this.sandbox = {
  };
  this.html5 = {
    'usingFlash': null
  };
  this.flash = {};
  this.html5Only = false;
  this.ignoreFlash = false;
  var SMSound,
  sm2 = this, globalHTML5Audio = null, flash = null, sm = 'soundManager', smc = sm + ': ', h5 = 'HTML5::', id, ua = navigator.userAgent, wl = window.location.href.toString(), doc = document, doNothing, setProperties, init, fV, on_queue = [], debugOpen = true, debugTS, didAppend = false, appendSuccess = false, didInit = false, disabled = false, windowLoaded = false, _wDS, wdCount = 0, initComplete, mixin, assign, extraOptions, addOnEvent, processOnEvents, initUserOnload, delayWaitForEI, waitForEI, rebootIntoHTML5, setVersionInfo, handleFocus, strings, initMovie, preInit, domContentLoaded, winOnLoad, didDCLoaded, getDocument, createMovie, catchError, setPolling, initDebug, debugLevels = ['log', 'info', 'warn', 'error'], defaultFlashVersion = 8, disableObject, failSafely, normalizeMovieURL, oRemoved = null, oRemovedHTML = null, str, flashBlockHandler, getSWFCSS, swfCSS, toggleDebug, loopFix, policyFix, complain, idCheck, waitingForEI = false, initPending = false, startTimer, stopTimer, timerExecute, h5TimerCount = 0, h5IntervalTimer = null, parseURL, messages = [],
  canIgnoreFlash, needsFlash = null, featureCheck, html5OK, html5CanPlay, html5Ext, html5Unload, domContentLoadedIE, testHTML5, event, slice = Array.prototype.slice, useGlobalHTML5Audio = false, lastGlobalHTML5URL, hasFlash, detectFlash, badSafariFix, html5_events, showSupport, flushMessages, wrapCallback, idCounter = 0,
  is_iDevice = ua.match(/(ipad|iphone|ipod)/i), isAndroid = ua.match(/android/i), isIE = ua.match(/msie/i), isWebkit = ua.match(/webkit/i), isSafari = (ua.match(/safari/i) && !ua.match(/chrome/i)), isOpera = (ua.match(/opera/i)),
  mobileHTML5 = (ua.match(/(mobile|pre\/|xoom)/i) || is_iDevice || isAndroid),
  isBadSafari = (!wl.match(/usehtml5audio/i) && !wl.match(/sm2\-ignorebadua/i) && isSafari && !ua.match(/silk/i) && ua.match(/OS X 10_6_([3-7])/i)),
  hasConsole = (window.console !== _undefined && console.log !== _undefined), isFocused = (doc.hasFocus !== _undefined?doc.hasFocus():null), tryInitOnFocus = (isSafari && (doc.hasFocus === _undefined || !doc.hasFocus())), okToDisable = !tryInitOnFocus, flashMIME = /(mp3|mp4|mpa|m4a|m4b)/i, msecScale = 1000,
  emptyURL = 'about:blank',
  emptyWAV = 'data:audio/wave;base64,/UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAD//w==',
  overHTTP = (doc.location?doc.location.protocol.match(/http/i):null),
  http = (!overHTTP ? 'http:/'+'/' : ''),
  netStreamMimeTypes = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,
  netStreamTypes = ['mpeg4', 'aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'm4b', 'mp4v', '3gp', '3g2'],
  netStreamPattern = new RegExp('\\.(' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
  this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;
  this.useAltURL = !overHTTP;
  swfCSS = {
    'swfBox': 'sm2-object-box',
    'swfDefault': 'movieContainer',
    'swfError': 'swf_error',
    'swfTimedout': 'swf_timedout',
    'swfLoaded': 'swf_loaded',
    'swfUnblocked': 'swf_unblocked',
    'sm2Debug': 'sm2_debug',
    'highPerf': 'high_performance',
    'flashDebug': 'flash_debug'
  };
  this.hasHTML5 = (function() {
    try {
      return (Audio !== _undefined && (isOpera && opera !== _undefined && opera.version() < 10 ? new Audio(null) : new Audio()).canPlayType !== _undefined);
    } catch(e) {
      return false;
    }
  }());
  this.setup = function(options) {
    var noURL = (!sm2.url);
    if (options !== _undefined && didInit && needsFlash && sm2.ok() && (options.flashVersion !== _undefined || options.url !== _undefined || options.html5Test !== _undefined)) {
    }
    assign(options);
    if (options) {
      if (noURL && didDCLoaded && options.url !== _undefined) {
        sm2.beginDelayedInit();
      }
      if (!didDCLoaded && options.url !== _undefined && doc.readyState === 'complete') {
        setTimeout(domContentLoaded, 1);
      }
    }
    return sm2;
  };
  this.ok = function() {
    return (needsFlash ? (didInit && !disabled) : (sm2.useHTML5Audio && sm2.hasHTML5));
  };
  this.supported = this.ok;
  this.getMovie = function(smID) {
    return id(smID) || doc[smID] || window[smID];
  };
  this.createSound = function(oOptions, _url) {
    var cs, cs_string, options, oSound = null;
    if (!didInit || !sm2.ok()) {
      return false;
    }
    if (_url !== _undefined) {
      oOptions = {
        'id': oOptions,
        'url': _url
      };
    }
    options = mixin(oOptions);
    options.url = parseURL(options.url);
    if (options.id === undefined) {
      options.id = sm2.setupOptions.idPrefix + (idCounter++);
    }
    if (idCheck(options.id, true)) {
      return sm2.sounds[options.id];
    }
    function make() {
      options = loopFix(options);
      sm2.sounds[options.id] = new SMSound(options);
      sm2.soundIDs.push(options.id);
      return sm2.sounds[options.id];
    }
    if (html5OK(options)) {
      oSound = make();
      oSound._setup_html5(options);
    } else {
      if (sm2.html5Only) {
        return make();
      }
      if (sm2.html5.usingFlash && options.url && options.url.match(/data\:/i)) {
        return make();
      }
      if (fV > 8) {
        if (options.isMovieStar === null) {
          options.isMovieStar = !!(options.serverURL || (options.type ? options.type.match(netStreamMimeTypes) : false) || (options.url && options.url.match(netStreamPattern)));
        }
      }
      options = policyFix(options, cs);
      oSound = make();
      if (fV === 8) {
        flash._createSound(options.id, options.loops||1, options.usePolicyFile);
      } else {
        flash._createSound(options.id, options.url, options.usePeakData, options.useWaveformData, options.useEQData, options.isMovieStar, (options.isMovieStar?options.bufferTime:false), options.loops||1, options.serverURL, options.duration||null, options.autoPlay, true, options.autoLoad, options.usePolicyFile);
        if (!options.serverURL) {
          oSound.connected = true;
          if (options.onconnect) {
            options.onconnect.apply(oSound);
          }
        }
      }
      if (!options.serverURL && (options.autoLoad || options.autoPlay)) {
        oSound.load(options);
      }
    }
    if (!options.serverURL && options.autoPlay) {
      oSound.play();
    }
    return oSound;
  };
  this.destroySound = function(sID, _bFromSound) {
    if (!idCheck(sID)) {
      return false;
    }
    var oS = sm2.sounds[sID], i;
    oS._iO = {};
    oS.stop();
    oS.unload();
    for (i = 0; i < sm2.soundIDs.length; i++) {
      if (sm2.soundIDs[i] === sID) {
        sm2.soundIDs.splice(i, 1);
        break;
      }
    }
    if (!_bFromSound) {
      oS.destruct(true);
    }
    oS = null;
    delete sm2.sounds[sID];
    return true;
  };
  this.load = function(sID, oOptions) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].load(oOptions);
  };
  this.unload = function(sID) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].unload();
  };
  this.onPosition = function(sID, nPosition, oMethod, oScope) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].onposition(nPosition, oMethod, oScope);
  };
  this.onposition = this.onPosition;
  this.clearOnPosition = function(sID, nPosition, oMethod) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].clearOnPosition(nPosition, oMethod);
  };
  this.play = function(sID, oOptions) {
    var result = null,
        overloaded = (oOptions && !(oOptions instanceof Object));
    if (!didInit || !sm2.ok()) {
      return false;
    }
    if (!idCheck(sID, overloaded)) {
      if (!overloaded) {
        return false;
      }
      if (overloaded) {
        oOptions = {
          url: oOptions
        };
      }
      if (oOptions && oOptions.url) {
        oOptions.id = sID;
        result = sm2.createSound(oOptions).play();
      }
    } else if (overloaded) {
      oOptions = {
        url: oOptions
      };
    }
    if (result === null) {
      result = sm2.sounds[sID].play(oOptions);
    }
    return result;
  };
  this.start = this.play;
  this.setPosition = function(sID, nMsecOffset) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setPosition(nMsecOffset);
  };
  this.stop = function(sID) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].stop();
  };
  this.stopAll = function() {
    var oSound;
    for (oSound in sm2.sounds) {
      if (sm2.sounds.hasOwnProperty(oSound)) {
        sm2.sounds[oSound].stop();
      }
    }
  };
  this.pause = function(sID) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].pause();
  };
  this.pauseAll = function() {
    var i;
    for (i = sm2.soundIDs.length-1; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].pause();
    }
  };
  this.resume = function(sID) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].resume();
  };
  this.resumeAll = function() {
    var i;
    for (i = sm2.soundIDs.length-1; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].resume();
    }
  };
  this.togglePause = function(sID) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].togglePause();
  };
  this.setPan = function(sID, nPan) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setPan(nPan);
  };
  this.setVolume = function(sID, nVol) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setVolume(nVol);
  };
  this.mute = function(sID) {
    var i = 0;
    if (sID instanceof String) {
      sID = null;
    }
    if (!sID) {
      for (i = sm2.soundIDs.length-1; i >= 0; i--) {
        sm2.sounds[sm2.soundIDs[i]].mute();
      }
      sm2.muted = true;
    } else {
      if (!idCheck(sID)) {
        return false;
      }
      return sm2.sounds[sID].mute();
    }
    return true;
  };
  this.muteAll = function() {
    sm2.mute();
  };
  this.unmute = function(sID) {
    var i;
    if (sID instanceof String) {
      sID = null;
    }
    if (!sID) {
      for (i = sm2.soundIDs.length-1; i >= 0; i--) {
        sm2.sounds[sm2.soundIDs[i]].unmute();
      }
      sm2.muted = false;
    } else {
      if (!idCheck(sID)) {
        return false;
      }
      return sm2.sounds[sID].unmute();
    }
    return true;
  };
  this.unmuteAll = function() {
    sm2.unmute();
  };
  this.toggleMute = function(sID) {
    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].toggleMute();
  };
  this.getMemoryUse = function() {
    var ram = 0;
    if (flash && fV !== 8) {
      ram = parseInt(flash._getMemoryUse(), 10);
    }
    return ram;
  };
  this.disable = function(bNoDisable) {
    var i;
    if (bNoDisable === _undefined) {
      bNoDisable = false;
    }
    if (disabled) {
      return false;
    }
    disabled = true;
    for (i = sm2.soundIDs.length-1; i >= 0; i--) {
      disableObject(sm2.sounds[sm2.soundIDs[i]]);
    }
    initComplete(bNoDisable);
    event.remove(window, 'load', initUserOnload);
    return true;
  };
  this.canPlayMIME = function(sMIME) {
    var result;
    if (sm2.hasHTML5) {
      result = html5CanPlay({type:sMIME});
    }
    if (!result && needsFlash) {
      result = (sMIME && sm2.ok() ? !!((fV > 8 ? sMIME.match(netStreamMimeTypes) : null) || sMIME.match(sm2.mimePattern)) : null);
    }
    return result;
  };
  this.canPlayURL = function(sURL) {
    var result;
    if (sm2.hasHTML5) {
      result = html5CanPlay({url: sURL});
    }
    if (!result && needsFlash) {
      result = (sURL && sm2.ok() ? !!(sURL.match(sm2.filePattern)) : null);
    }
    return result;
  };
  this.canPlayLink = function(oLink) {
    if (oLink.type !== _undefined && oLink.type) {
      if (sm2.canPlayMIME(oLink.type)) {
        return true;
      }
    }
    return sm2.canPlayURL(oLink.href);
  };
  this.getSoundById = function(sID, _suppressDebug) {
    if (!sID) {
      return null;
    }
    var result = sm2.sounds[sID];
    return result;
  };
  this.onready = function(oMethod, oScope) {
    var sType = 'onready',
        result = false;
    if (typeof oMethod === 'function') {
      if (!oScope) {
        oScope = window;
      }
      addOnEvent(sType, oMethod, oScope);
      processOnEvents();
      result = true;
    } else {
      throw str('needFunction', sType);
    }
    return result;
  };
  this.ontimeout = function(oMethod, oScope) {
    var sType = 'ontimeout',
        result = false;
    if (typeof oMethod === 'function') {
      if (!oScope) {
        oScope = window;
      }
      addOnEvent(sType, oMethod, oScope);
      processOnEvents({type:sType});
      result = true;
    } else {
      throw str('needFunction', sType);
    }
    return result;
  };
  this._writeDebug = function(sText, sTypeOrObject) {
    return true;
  };
  this._wD = this._writeDebug;
  this._debug = function() {
  };
  this.reboot = function(resetEvents, excludeInit) {
    var i, j, k;
    for (i = sm2.soundIDs.length-1; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].destruct();
    }
    if (flash) {
      try {
        if (isIE) {
          oRemovedHTML = flash.innerHTML;
        }
        oRemoved = flash.parentNode.removeChild(flash);
      } catch(e) {
      }
    }
    oRemovedHTML = oRemoved = needsFlash = flash = null;
    sm2.enabled = didDCLoaded = didInit = waitingForEI = initPending = didAppend = appendSuccess = disabled = useGlobalHTML5Audio = sm2.swfLoaded = false;
    sm2.soundIDs = [];
    sm2.sounds = {};
    idCounter = 0;
    if (!resetEvents) {
      for (i in on_queue) {
        if (on_queue.hasOwnProperty(i)) {
          for (j = 0, k = on_queue[i].length; j < k; j++) {
            on_queue[i][j].fired = false;
          }
        }
      }
    } else {
      on_queue = [];
    }
    sm2.html5 = {
      'usingFlash': null
    };
    sm2.flash = {};
    sm2.html5Only = false;
    sm2.ignoreFlash = false;
    window.setTimeout(function() {
      preInit();
      if (!excludeInit) {
        sm2.beginDelayedInit();
      }
    }, 20);
    return sm2;
  };
  this.reset = function() {
    return sm2.reboot(true, true);
  };
  this.getMoviePercent = function() {
    return (flash && 'PercentLoaded' in flash ? flash.PercentLoaded() : null);
  };
  this.beginDelayedInit = function() {
    windowLoaded = true;
    domContentLoaded();
    setTimeout(function() {
      if (initPending) {
        return false;
      }
      createMovie();
      initMovie();
      initPending = true;
      return true;
    }, 20);
    delayWaitForEI();
  };
  this.destruct = function() {
    sm2.disable(true);
  };
  SMSound = function(oOptions) {
    var s = this, resetProperties, add_html5_events, remove_html5_events, stop_html5_timer, start_html5_timer, attachOnPosition, onplay_called = false, onPositionItems = [], onPositionFired = 0, detachOnPosition, applyFromTo, lastURL = null, lastHTML5State, urlOmitted;
    lastHTML5State = {
      duration: null,
      time: null
    };
    this.id = oOptions.id;
    this.sID = this.id;
    this.url = oOptions.url;
    this.options = mixin(oOptions);
    this.instanceOptions = this.options;
    this._iO = this.instanceOptions;
    this.pan = this.options.pan;
    this.volume = this.options.volume;
    this.isHTML5 = false;
    this._a = null;
    urlOmitted = (this.url ? false : true);
    this.id3 = {};
    this._debug = function() {
    };
    this.load = function(oOptions) {
      var oSound = null, instanceOptions;
      if (oOptions !== _undefined) {
        s._iO = mixin(oOptions, s.options);
      } else {
        oOptions = s.options;
        s._iO = oOptions;
        if (lastURL && lastURL !== s.url) {
          s._iO.url = s.url;
          s.url = null;
        }
      }
      if (!s._iO.url) {
        s._iO.url = s.url;
      }
      s._iO.url = parseURL(s._iO.url);
      s.instanceOptions = s._iO;
      instanceOptions = s._iO;
      if (!instanceOptions.url && !s.url) {
        return s;
      }
      if (instanceOptions.url === s.url && s.readyState !== 0 && s.readyState !== 2) {
        if (s.readyState === 3 && instanceOptions.onload) {
          wrapCallback(s, function() {
            instanceOptions.onload.apply(s, [(!!s.duration)]);
          });
        }
        return s;
      }
      s.loaded = false;
      s.readyState = 1;
      s.playState = 0;
      s.id3 = {};
      if (html5OK(instanceOptions)) {
        oSound = s._setup_html5(instanceOptions);
        if (!oSound._called_load) {
          s._html5_canplay = false;
          if (s.url !== instanceOptions.url) {
            s._a.src = instanceOptions.url;
            s.setPosition(0);
          }
          s._a.autobuffer = 'auto';
          s._a.preload = 'auto';
          s._a._called_load = true;
        } else {
        }
      } else {
        if (sm2.html5Only) {
          return s;
        }
        if (s._iO.url && s._iO.url.match(/data\:/i)) {
          return s;
        }
        try {
          s.isHTML5 = false;
          s._iO = policyFix(loopFix(instanceOptions));
          if (s._iO.autoPlay && (s._iO.position || s._iO.from)) {
            s._iO.autoPlay = false;
          }
          instanceOptions = s._iO;
          if (fV === 8) {
            flash._load(s.id, instanceOptions.url, instanceOptions.stream, instanceOptions.autoPlay, instanceOptions.usePolicyFile);
          } else {
            flash._load(s.id, instanceOptions.url, !!(instanceOptions.stream), !!(instanceOptions.autoPlay), instanceOptions.loops||1, !!(instanceOptions.autoLoad), instanceOptions.usePolicyFile);
          }
        } catch(e) {
          catchError({type:'SMSOUND_LOAD_JS_EXCEPTION', fatal:true});
        }
      }
      s.url = instanceOptions.url;
      return s;
    };
    this.unload = function() {
      if (s.readyState !== 0) {
        if (!s.isHTML5) {
          if (fV === 8) {
            flash._unload(s.id, emptyURL);
          } else {
            flash._unload(s.id);
          }
        } else {
          stop_html5_timer();
          if (s._a) {
            s._a.pause();
            lastURL = html5Unload(s._a);
          }
        }
        resetProperties();
      }
      return s;
    };
    this.destruct = function(_bFromSM) {
      if (!s.isHTML5) {
        s._iO.onfailure = null;
        flash._destroySound(s.id);
      } else {
        stop_html5_timer();
        if (s._a) {
          s._a.pause();
          html5Unload(s._a);
          if (!useGlobalHTML5Audio) {
            remove_html5_events();
          }
          s._a._s = null;
          s._a = null;
        }
      }
      if (!_bFromSM) {
        sm2.destroySound(s.id, true);
      }
    };
    this.play = function(oOptions, _updatePlayState) {
      var fN, allowMulti, a, onready,
          audioClone, onended, oncanplay,
          startOK = true,
          exit = null;
      _updatePlayState = (_updatePlayState === _undefined ? true : _updatePlayState);
      if (!oOptions) {
        oOptions = {};
      }
      if (s.url) {
        s._iO.url = s.url;
      }
      s._iO = mixin(s._iO, s.options);
      s._iO = mixin(oOptions, s._iO);
      s._iO.url = parseURL(s._iO.url);
      s.instanceOptions = s._iO;
      if (!s.isHTML5 && s._iO.serverURL && !s.connected) {
        if (!s.getAutoPlay()) {
          s.setAutoPlay(true);
        }
        return s;
      }
      if (html5OK(s._iO)) {
        s._setup_html5(s._iO);
        start_html5_timer();
      }
      if (s.playState === 1 && !s.paused) {
        allowMulti = s._iO.multiShot;
        if (!allowMulti) {
          if (s.isHTML5) {
            s.setPosition(s._iO.position);
          }
          exit = s;
        } else {
        }
      }
      if (exit !== null) {
        return exit;
      }
      if (oOptions.url && oOptions.url !== s.url) {
        if (!s.readyState && !s.isHTML5 && fV === 8 && urlOmitted) {
          urlOmitted = false;
        } else {
          s.load(s._iO);
        }
      }
      if (!s.loaded) {
        if (s.readyState === 0) {
          if (!s.isHTML5 && !sm2.html5Only) {
            s._iO.autoPlay = true;
            s.load(s._iO);
          } else if (s.isHTML5) {
            s.load(s._iO);
          } else {
            exit = s;
          }
          s.instanceOptions = s._iO;
        } else if (s.readyState === 2) {
          exit = s;
        } else {
        }
      } else {
      }
      if (exit !== null) {
        return exit;
      }
      if (!s.isHTML5 && fV === 9 && s.position > 0 && s.position === s.duration) {
        oOptions.position = 0;
      }
      if (s.paused && s.position >= 0 && (!s._iO.serverURL || s.position > 0)) {
        s.resume();
      } else {
        s._iO = mixin(oOptions, s._iO);
        if (((!s.isHTML5 && s._iO.position !== null && s._iO.position > 0) || (s._iO.from !== null && s._iO.from > 0) || s._iO.to !== null) && s.instanceCount === 0 && s.playState === 0 && !s._iO.serverURL) {
          onready = function() {
            s._iO = mixin(oOptions, s._iO);
            s.play(s._iO);
          };
          if (s.isHTML5 && !s._html5_canplay) {
            s.load({
              _oncanplay: onready
            });
            exit = false;
          } else if (!s.isHTML5 && !s.loaded && (!s.readyState || s.readyState !== 2)) {
            s.load({
              onload: onready
            });
            exit = false;
          }
          if (exit !== null) {
            return exit;
          }
          s._iO = applyFromTo();
        }
        if (!s.instanceCount || s._iO.multiShotEvents || (s.isHTML5 && s._iO.multiShot && !useGlobalHTML5Audio) || (!s.isHTML5 && fV > 8 && !s.getAutoPlay())) {
          s.instanceCount++;
        }
        if (s._iO.onposition && s.playState === 0) {
          attachOnPosition(s);
        }
        s.playState = 1;
        s.paused = false;
        s.position = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position : 0);
        if (!s.isHTML5) {
          s._iO = policyFix(loopFix(s._iO));
        }
        if (s._iO.onplay && _updatePlayState) {
          s._iO.onplay.apply(s);
          onplay_called = true;
        }
        s.setVolume(s._iO.volume, true);
        s.setPan(s._iO.pan, true);
        if (!s.isHTML5) {
          startOK = flash._start(s.id, s._iO.loops || 1, (fV === 9 ? s.position : s.position / msecScale), s._iO.multiShot || false);
          if (fV === 9 && !startOK) {
            if (s._iO.onplayerror) {
              s._iO.onplayerror.apply(s);
            }
          }
        } else {
          if (s.instanceCount < 2) {
            start_html5_timer();
            a = s._setup_html5();
            s.setPosition(s._iO.position);
            a.play();
          } else {
            audioClone = new Audio(s._iO.url);
            onended = function() {
              event.remove(audioClone, 'ended', onended);
              s._onfinish(s);
              html5Unload(audioClone);
              audioClone = null;
            };
            oncanplay = function() {
              event.remove(audioClone, 'canplay', oncanplay);
              try {
                audioClone.currentTime = s._iO.position/msecScale;
              } catch(err) {
              }
              audioClone.play();
            };
            event.add(audioClone, 'ended', onended);
            if (s._iO.volume !== undefined) {
              audioClone.volume = Math.max(0, Math.min(1, s._iO.volume/100));
            }
            if (s.muted) {
              audioClone.muted = true;
            }
            if (s._iO.position) {
              event.add(audioClone, 'canplay', oncanplay);
            } else {
              audioClone.play();
            }
          }
        }
      }
      return s;
    };
    this.start = this.play;
    this.stop = function(bAll) {
      var instanceOptions = s._iO,
          originalPosition;
      if (s.playState === 1) {
        s._onbufferchange(0);
        s._resetOnPosition(0);
        s.paused = false;
        if (!s.isHTML5) {
          s.playState = 0;
        }
        detachOnPosition();
        if (instanceOptions.to) {
          s.clearOnPosition(instanceOptions.to);
        }
        if (!s.isHTML5) {
          flash._stop(s.id, bAll);
          if (instanceOptions.serverURL) {
            s.unload();
          }
        } else {
          if (s._a) {
            originalPosition = s.position;
            s.setPosition(0);
            s.position = originalPosition;
            s._a.pause();
            s.playState = 0;
            s._onTimer();
            stop_html5_timer();
          }
        }
        s.instanceCount = 0;
        s._iO = {};
        if (instanceOptions.onstop) {
          instanceOptions.onstop.apply(s);
        }
      }
      return s;
    };
    this.setAutoPlay = function(autoPlay) {
      s._iO.autoPlay = autoPlay;
      if (!s.isHTML5) {
        flash._setAutoPlay(s.id, autoPlay);
        if (autoPlay) {
          if (!s.instanceCount && s.readyState === 1) {
            s.instanceCount++;
          }
        }
      }
    };
    this.getAutoPlay = function() {
      return s._iO.autoPlay;
    };
    this.setPosition = function(nMsecOffset) {
      if (nMsecOffset === _undefined) {
        nMsecOffset = 0;
      }
      var position, position1K,
          offset = (s.isHTML5 ? Math.max(nMsecOffset, 0) : Math.min(s.duration || s._iO.duration, Math.max(nMsecOffset, 0)));
      s.position = offset;
      position1K = s.position/msecScale;
      s._resetOnPosition(s.position);
      s._iO.position = offset;
      if (!s.isHTML5) {
        position = (fV === 9 ? s.position : position1K);
        if (s.readyState && s.readyState !== 2) {
          flash._setPosition(s.id, position, (s.paused || !s.playState), s._iO.multiShot);
        }
      } else if (s._a) {
        if (s._html5_canplay) {
          if (s._a.currentTime !== position1K) {
            try {
              s._a.currentTime = position1K;
              if (s.playState === 0 || s.paused) {
                s._a.pause();
              }
            } catch(e) {
            }
          }
        } else if (position1K) {
          return s;
        }
        if (s.paused) {
          s._onTimer(true);
        }
      }
      return s;
    };
    this.pause = function(_bCallFlash) {
      if (s.paused || (s.playState === 0 && s.readyState !== 1)) {
        return s;
      }
      s.paused = true;
      if (!s.isHTML5) {
        if (_bCallFlash || _bCallFlash === _undefined) {
          flash._pause(s.id, s._iO.multiShot);
        }
      } else {
        s._setup_html5().pause();
        stop_html5_timer();
      }
      if (s._iO.onpause) {
        s._iO.onpause.apply(s);
      }
      return s;
    };
    this.resume = function() {
      var instanceOptions = s._iO;
      if (!s.paused) {
        return s;
      }
      s.paused = false;
      s.playState = 1;
      if (!s.isHTML5) {
        if (instanceOptions.isMovieStar && !instanceOptions.serverURL) {
          s.setPosition(s.position);
        }
        flash._pause(s.id, instanceOptions.multiShot);
      } else {
        s._setup_html5().play();
        start_html5_timer();
      }
      if (!onplay_called && instanceOptions.onplay) {
        instanceOptions.onplay.apply(s);
        onplay_called = true;
      } else if (instanceOptions.onresume) {
        instanceOptions.onresume.apply(s);
      }
      return s;
    };
    this.togglePause = function() {
      if (s.playState === 0) {
        s.play({
          position: (fV === 9 && !s.isHTML5 ? s.position : s.position / msecScale)
        });
        return s;
      }
      if (s.paused) {
        s.resume();
      } else {
        s.pause();
      }
      return s;
    };
    this.setPan = function(nPan, bInstanceOnly) {
      if (nPan === _undefined) {
        nPan = 0;
      }
      if (bInstanceOnly === _undefined) {
        bInstanceOnly = false;
      }
      if (!s.isHTML5) {
        flash._setPan(s.id, nPan);
      }
      s._iO.pan = nPan;
      if (!bInstanceOnly) {
        s.pan = nPan;
        s.options.pan = nPan;
      }
      return s;
    };
    this.setVolume = function(nVol, _bInstanceOnly) {
      if (nVol === _undefined) {
        nVol = 100;
      }
      if (_bInstanceOnly === _undefined) {
        _bInstanceOnly = false;
      }
      if (!s.isHTML5) {
        flash._setVolume(s.id, (sm2.muted && !s.muted) || s.muted?0:nVol);
      } else if (s._a) {
        if (sm2.muted && !s.muted) {
          s.muted = true;
          s._a.muted = true;
        }
        s._a.volume = Math.max(0, Math.min(1, nVol/100));
      }
      s._iO.volume = nVol;
      if (!_bInstanceOnly) {
        s.volume = nVol;
        s.options.volume = nVol;
      }
      return s;
    };
    this.mute = function() {
      s.muted = true;
      if (!s.isHTML5) {
        flash._setVolume(s.id, 0);
      } else if (s._a) {
        s._a.muted = true;
      }
      return s;
    };
    this.unmute = function() {
      s.muted = false;
      var hasIO = (s._iO.volume !== _undefined);
      if (!s.isHTML5) {
        flash._setVolume(s.id, hasIO?s._iO.volume:s.options.volume);
      } else if (s._a) {
        s._a.muted = false;
      }
      return s;
    };
    this.toggleMute = function() {
      return (s.muted?s.unmute():s.mute());
    };
    this.onPosition = function(nPosition, oMethod, oScope) {
      onPositionItems.push({
        position: parseInt(nPosition, 10),
        method: oMethod,
        scope: (oScope !== _undefined ? oScope : s),
        fired: false
      });
      return s;
    };
    this.onposition = this.onPosition;
    this.clearOnPosition = function(nPosition, oMethod) {
      var i;
      nPosition = parseInt(nPosition, 10);
      if (isNaN(nPosition)) {
        return false;
      }
      for (i=0; i < onPositionItems.length; i++) {
        if (nPosition === onPositionItems[i].position) {
          if (!oMethod || (oMethod === onPositionItems[i].method)) {
            if (onPositionItems[i].fired) {
              onPositionFired--;
            }
            onPositionItems.splice(i, 1);
          }
        }
      }
    };
    this._processOnPosition = function() {
      var i, item, j = onPositionItems.length;
      if (!j || !s.playState || onPositionFired >= j) {
        return false;
      }
      for (i=j-1; i >= 0; i--) {
        item = onPositionItems[i];
        if (!item.fired && s.position >= item.position) {
          item.fired = true;
          onPositionFired++;
          item.method.apply(item.scope, [item.position]);
		  j = onPositionItems.length;
        }
      }
      return true;
    };
    this._resetOnPosition = function(nPosition) {
      var i, item, j = onPositionItems.length;
      if (!j) {
        return false;
      }
      for (i=j-1; i >= 0; i--) {
        item = onPositionItems[i];
        if (item.fired && nPosition <= item.position) {
          item.fired = false;
          onPositionFired--;
        }
      }
      return true;
    };
    applyFromTo = function() {
      var instanceOptions = s._iO,
          f = instanceOptions.from,
          t = instanceOptions.to,
          start, end;
      end = function() {
        s.clearOnPosition(t, end);
        s.stop();
      };
      start = function() {
        if (t !== null && !isNaN(t)) {
          s.onPosition(t, end);
        }
      };
      if (f !== null && !isNaN(f)) {
        instanceOptions.position = f;
        instanceOptions.multiShot = false;
        start();
      }
      return instanceOptions;
    };
    attachOnPosition = function() {
      var item,
          op = s._iO.onposition;
      if (op) {
        for (item in op) {
          if (op.hasOwnProperty(item)) {
            s.onPosition(parseInt(item, 10), op[item]);
          }
        }
      }
    };
    detachOnPosition = function() {
      var item,
          op = s._iO.onposition;
      if (op) {
        for (item in op) {
          if (op.hasOwnProperty(item)) {
            s.clearOnPosition(parseInt(item, 10));
          }
        }
      }
    };
    start_html5_timer = function() {
      if (s.isHTML5) {
        startTimer(s);
      }
    };
    stop_html5_timer = function() {
      if (s.isHTML5) {
        stopTimer(s);
      }
    };
    resetProperties = function(retainPosition) {
      if (!retainPosition) {
        onPositionItems = [];
        onPositionFired = 0;
      }
      onplay_called = false;
      s._hasTimer = null;
      s._a = null;
      s._html5_canplay = false;
      s.bytesLoaded = null;
      s.bytesTotal = null;
      s.duration = (s._iO && s._iO.duration ? s._iO.duration : null);
      s.durationEstimate = null;
      s.buffered = [];
      s.eqData = [];
      s.eqData.left = [];
      s.eqData.right = [];
      s.failures = 0;
      s.isBuffering = false;
      s.instanceOptions = {};
      s.instanceCount = 0;
      s.loaded = false;
      s.metadata = {};
      s.readyState = 0;
      s.muted = false;
      s.paused = false;
      s.peakData = {
        left: 0,
        right: 0
      };
      s.waveformData = {
        left: [],
        right: []
      };
      s.playState = 0;
      s.position = null;
      s.id3 = {};
    };
    resetProperties();
    this._onTimer = function(bForce) {
      var duration, isNew = false, time, x = {};
      if (s._hasTimer || bForce) {
        if (s._a && (bForce || ((s.playState > 0 || s.readyState === 1) && !s.paused))) {
          duration = s._get_html5_duration();
          if (duration !== lastHTML5State.duration) {
            lastHTML5State.duration = duration;
            s.duration = duration;
            isNew = true;
          }
          s.durationEstimate = s.duration;
          time = (s._a.currentTime * msecScale || 0);
          if (time !== lastHTML5State.time) {
            lastHTML5State.time = time;
            isNew = true;
          }
          if (isNew || bForce) {
            s._whileplaying(time,x,x,x,x);
          }
        }
        return isNew;
      }
    };
    this._get_html5_duration = function() {
      var instanceOptions = s._iO,
          d = (s._a && s._a.duration ? s._a.duration*msecScale : (instanceOptions && instanceOptions.duration ? instanceOptions.duration : null)),
          result = (d && !isNaN(d) && d !== Infinity ? d : null);
      return result;
    };
    this._apply_loop = function(a, nLoops) {
      a.loop = (nLoops > 1 ? 'loop' : '');
    };
    this._setup_html5 = function(oOptions) {
      var instanceOptions = mixin(s._iO, oOptions),
          a = useGlobalHTML5Audio ? globalHTML5Audio : s._a,
          dURL = decodeURI(instanceOptions.url),
          sameURL;
      if (useGlobalHTML5Audio) {
        if (dURL === decodeURI(lastGlobalHTML5URL)) {
          sameURL = true;
        }
      } else if (dURL === decodeURI(lastURL)) {
        sameURL = true;
      }
      if (a) {
        if (a._s) {
          if (useGlobalHTML5Audio) {
            if (a._s && a._s.playState && !sameURL) {
              a._s.stop();
            }
          } else if (!useGlobalHTML5Audio && dURL === decodeURI(lastURL)) {
            s._apply_loop(a, instanceOptions.loops);
            return a;
          }
        }
        if (!sameURL) {
          if (lastURL) {
            resetProperties(false);
          }
          a.src = instanceOptions.url;
          s.url = instanceOptions.url;
          lastURL = instanceOptions.url;
          lastGlobalHTML5URL = instanceOptions.url;
          a._called_load = false;
        }
      } else {
        if (instanceOptions.autoLoad || instanceOptions.autoPlay) {
          s._a = new Audio(instanceOptions.url);
          s._a.load();
        } else {
          s._a = (isOpera && opera.version() < 10 ? new Audio(null) : new Audio());
        }
        a = s._a;
        a._called_load = false;
        if (useGlobalHTML5Audio) {
          globalHTML5Audio = a;
        }
      }
      s.isHTML5 = true;
      s._a = a;
      a._s = s;
      add_html5_events();
      s._apply_loop(a, instanceOptions.loops);
      if (instanceOptions.autoLoad || instanceOptions.autoPlay) {
        s.load();
      } else {
        a.autobuffer = false;
        a.preload = 'auto';
      }
      return a;
    };
    add_html5_events = function() {
      if (s._a._added_events) {
        return false;
      }
      var f;
      function add(oEvt, oFn, bCapture) {
        return s._a ? s._a.addEventListener(oEvt, oFn, bCapture||false) : null;
      }
      s._a._added_events = true;
      for (f in html5_events) {
        if (html5_events.hasOwnProperty(f)) {
          add(f, html5_events[f]);
        }
      }
      return true;
    };
    remove_html5_events = function() {
      var f;
      function remove(oEvt, oFn, bCapture) {
        return (s._a ? s._a.removeEventListener(oEvt, oFn, bCapture||false) : null);
      }
      s._a._added_events = false;
      for (f in html5_events) {
        if (html5_events.hasOwnProperty(f)) {
          remove(f, html5_events[f]);
        }
      }
    };
    this._onload = function(nSuccess) {
      var fN,
          loadOK = !!nSuccess || (!s.isHTML5 && fV === 8 && s.duration);
      s.loaded = loadOK;
      s.readyState = loadOK?3:2;
      s._onbufferchange(0);
      if (s._iO.onload) {
        wrapCallback(s, function() {
          s._iO.onload.apply(s, [loadOK]);
        });
      }
      return true;
    };
    this._onbufferchange = function(nIsBuffering) {
      if (s.playState === 0) {
        return false;
      }
      if ((nIsBuffering && s.isBuffering) || (!nIsBuffering && !s.isBuffering)) {
        return false;
      }
      s.isBuffering = (nIsBuffering === 1);
      if (s._iO.onbufferchange) {
        s._iO.onbufferchange.apply(s, [nIsBuffering]);
      }
      return true;
    };
    this._onsuspend = function() {
      if (s._iO.onsuspend) {
        s._iO.onsuspend.apply(s);
      }
      return true;
    };
    this._onfailure = function(msg, level, code) {
      s.failures++;
      if (s._iO.onfailure && s.failures === 1) {
        s._iO.onfailure(msg, level, code);
      } else {
      }
    };
    this._onwarning = function(msg, level, code) {
      if (s._iO.onwarning) {
        s._iO.onwarning(msg, level, code);
      }
    };
    this._onfinish = function() {
      var io_onfinish = s._iO.onfinish;
      s._onbufferchange(0);
      s._resetOnPosition(0);
      if (s.instanceCount) {
        s.instanceCount--;
        if (!s.instanceCount) {
          detachOnPosition();
          s.playState = 0;
          s.paused = false;
          s.instanceCount = 0;
          s.instanceOptions = {};
          s._iO = {};
          stop_html5_timer();
          if (s.isHTML5) {
            s.position = 0;
          }
        }
        if (!s.instanceCount || s._iO.multiShotEvents) {
          if (io_onfinish) {
            wrapCallback(s, function() {
              io_onfinish.apply(s);
            });
          }
        }
      }
    };
    this._whileloading = function(nBytesLoaded, nBytesTotal, nDuration, nBufferLength) {
      var instanceOptions = s._iO;
      s.bytesLoaded = nBytesLoaded;
      s.bytesTotal = nBytesTotal;
      s.duration = Math.floor(nDuration);
      s.bufferLength = nBufferLength;
      if (!s.isHTML5 && !instanceOptions.isMovieStar) {
        if (instanceOptions.duration) {
          s.durationEstimate = (s.duration > instanceOptions.duration) ? s.duration : instanceOptions.duration;
        } else {
          s.durationEstimate = parseInt((s.bytesTotal / s.bytesLoaded) * s.duration, 10);
        }
      } else {
        s.durationEstimate = s.duration;
      }
      if (!s.isHTML5) {
        s.buffered = [{
          'start': 0,
          'end': s.duration
        }];
      }
      if ((s.readyState !== 3 || s.isHTML5) && instanceOptions.whileloading) {
        instanceOptions.whileloading.apply(s);
      }
    };
    this._whileplaying = function(nPosition, oPeakData, oWaveformDataLeft, oWaveformDataRight, oEQData) {
      var instanceOptions = s._iO,
          eqLeft;
      if (isNaN(nPosition) || nPosition === null) {
        return false;
      }
      s.position = Math.max(0, nPosition);
      s._processOnPosition();
      if (!s.isHTML5 && fV > 8) {
        if (instanceOptions.usePeakData && oPeakData !== _undefined && oPeakData) {
          s.peakData = {
            left: oPeakData.leftPeak,
            right: oPeakData.rightPeak
          };
        }
        if (instanceOptions.useWaveformData && oWaveformDataLeft !== _undefined && oWaveformDataLeft) {
          s.waveformData = {
            left: oWaveformDataLeft.split(','),
            right: oWaveformDataRight.split(',')
          };
        }
        if (instanceOptions.useEQData) {
          if (oEQData !== _undefined && oEQData && oEQData.leftEQ) {
            eqLeft = oEQData.leftEQ.split(',');
            s.eqData = eqLeft;
            s.eqData.left = eqLeft;
            if (oEQData.rightEQ !== _undefined && oEQData.rightEQ) {
              s.eqData.right = oEQData.rightEQ.split(',');
            }
          }
        }
      }
      if (s.playState === 1) {
        if (!s.isHTML5 && fV === 8 && !s.position && s.isBuffering) {
          s._onbufferchange(0);
        }
        if (instanceOptions.whileplaying) {
          instanceOptions.whileplaying.apply(s);
        }
      }
      return true;
    };
    this._oncaptiondata = function(oData) {
      s.captiondata = oData;
      if (s._iO.oncaptiondata) {
        s._iO.oncaptiondata.apply(s, [oData]);
      }
    };
    this._onmetadata = function(oMDProps, oMDData) {
      var oData = {}, i, j;
      for (i = 0, j = oMDProps.length; i < j; i++) {
        oData[oMDProps[i]] = oMDData[i];
      }
      s.metadata = oData;
console.log('updated metadata', s.metadata);
      if (s._iO.onmetadata) {
        s._iO.onmetadata.call(s, s.metadata);
      }
    };
    this._onid3 = function(oID3Props, oID3Data) {
      var oData = [], i, j;
      for (i = 0, j = oID3Props.length; i < j; i++) {
        oData[oID3Props[i]] = oID3Data[i];
      }
      s.id3 = mixin(s.id3, oData);
      if (s._iO.onid3) {
        s._iO.onid3.apply(s);
      }
    };
    this._onconnect = function(bSuccess) {
      bSuccess = (bSuccess === 1);
      s.connected = bSuccess;
      if (bSuccess) {
        s.failures = 0;
        if (idCheck(s.id)) {
          if (s.getAutoPlay()) {
            s.play(_undefined, s.getAutoPlay());
          } else if (s._iO.autoLoad) {
            s.load();
          }
        }
        if (s._iO.onconnect) {
          s._iO.onconnect.apply(s, [bSuccess]);
        }
      }
    };
    this._ondataerror = function(sError) {
      if (s.playState > 0) {
        if (s._iO.ondataerror) {
          s._iO.ondataerror.apply(s);
        }
      }
    };
  };
  getDocument = function() {
    return (doc.body || doc.getElementsByTagName('div')[0]);
  };
  id = function(sID) {
    return doc.getElementById(sID);
  };
  mixin = function(oMain, oAdd) {
    var o1 = (oMain || {}), o2, o;
    o2 = (oAdd === _undefined ? sm2.defaultOptions : oAdd);
    for (o in o2) {
      if (o2.hasOwnProperty(o) && o1[o] === _undefined) {
        if (typeof o2[o] !== 'object' || o2[o] === null) {
          o1[o] = o2[o];
        } else {
          o1[o] = mixin(o1[o], o2[o]);
        }
      }
    }
    return o1;
  };
  wrapCallback = function(oSound, callback) {
    if (!oSound.isHTML5 && fV === 8) {
      window.setTimeout(callback, 0);
    } else {
      callback();
    }
  };
  extraOptions = {
    'onready': 1,
    'ontimeout': 1,
    'defaultOptions': 1,
    'flash9Options': 1,
    'movieStarOptions': 1
  };
  assign = function(o, oParent) {
    var i,
        result = true,
        hasParent = (oParent !== _undefined),
        setupOptions = sm2.setupOptions,
        bonusOptions = extraOptions;
    for (i in o) {
      if (o.hasOwnProperty(i)) {
        if (typeof o[i] !== 'object' || o[i] === null || o[i] instanceof Array || o[i] instanceof RegExp) {
          if (hasParent && bonusOptions[oParent] !== _undefined) {
            sm2[oParent][i] = o[i];
          } else if (setupOptions[i] !== _undefined) {
            sm2.setupOptions[i] = o[i];
            sm2[i] = o[i];
          } else if (bonusOptions[i] === _undefined) {
            result = false;
          } else {
            if (sm2[i] instanceof Function) {
              sm2[i].apply(sm2, (o[i] instanceof Array? o[i] : [o[i]]));
            } else {
              sm2[i] = o[i];
            }
          }
        } else {
          if (bonusOptions[i] === _undefined) {
            result = false;
          } else {
            return assign(o[i], i);
          }
        }
      }
    }
    return result;
  };
  function preferFlashCheck(kind) {
    return (sm2.preferFlash && hasFlash && !sm2.ignoreFlash && (sm2.flash[kind] !== _undefined && sm2.flash[kind]));
  }
  event = (function() {
    var old = (window.attachEvent),
    evt = {
      add: (old?'attachEvent':'addEventListener'),
      remove: (old?'detachEvent':'removeEventListener')
    };
    function getArgs(oArgs) {
      var args = slice.call(oArgs),
          len = args.length;
      if (old) {
        args[1] = 'on' + args[1];
        if (len > 3) {
          args.pop();
        }
      } else if (len === 3) {
        args.push(false);
      }
      return args;
    }
    function apply(args, sType) {
      var element = args.shift(),
          method = [evt[sType]];
      if (old) {
        element[method](args[0], args[1]);
      } else {
        element[method].apply(element, args);
      }
    }
    function add() {
      apply(getArgs(arguments), 'add');
    }
    function remove() {
      apply(getArgs(arguments), 'remove');
    }
    return {
      'add': add,
      'remove': remove
    };
  }());
  function html5_event(oFn) {
    return function(e) {
      var s = this._s,
          result;
      if (!s || !s._a) {
        result = null;
      } else {
        result = oFn.call(this, e);
      }
      return result;
    };
  }
  html5_events = {
    abort: html5_event(function() {
    }),
    canplay: html5_event(function() {
      var s = this._s,
          position1K;
      if (s._html5_canplay) {
        return true;
      }
      s._html5_canplay = true;
      s._onbufferchange(0);
      position1K = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position/msecScale : null);
      if (this.currentTime !== position1K) {
        try {
          this.currentTime = position1K;
        } catch(ee) {
        }
      }
      if (s._iO._oncanplay) {
        s._iO._oncanplay();
      }
    }),
    canplaythrough: html5_event(function() {
      var s = this._s;
      if (!s.loaded) {
        s._onbufferchange(0);
        s._whileloading(s.bytesLoaded, s.bytesTotal, s._get_html5_duration());
        s._onload(true);
      }
    }),
    durationchange: html5_event(function() {
      var s = this._s,
          duration;
      duration = s._get_html5_duration();
      if (!isNaN(duration) && duration !== s.duration) {
        s.durationEstimate = s.duration = duration;
      }
    }),
    ended: html5_event(function() {
      var s = this._s;
      s._onfinish();
    }),
    error: html5_event(function() {
      this._s._onload(false);
    }),
    loadeddata: html5_event(function() {
      var s = this._s;
      if (!s._loaded && !isSafari) {
        s.duration = s._get_html5_duration();
      }
    }),
    loadedmetadata: html5_event(function() {
    }),
    loadstart: html5_event(function() {
      this._s._onbufferchange(1);
    }),
    play: html5_event(function() {
      this._s._onbufferchange(0);
    }),
    playing: html5_event(function() {
      this._s._onbufferchange(0);
    }),
    progress: html5_event(function(e) {
      var s = this._s,
          i, j, progStr, buffered = 0,
          isProgress = (e.type === 'progress'),
          ranges = e.target.buffered,
          loaded = (e.loaded||0),
          total = (e.total||1);
      s.buffered = [];
      if (ranges && ranges.length) {
        for (i=0, j=ranges.length; i<j; i++) {
          s.buffered.push({
            'start': ranges.start(i) * msecScale,
            'end': ranges.end(i) * msecScale
          });
        }
        buffered = (ranges.end(0) - ranges.start(0)) * msecScale;
        loaded = Math.min(1, buffered/(e.target.duration*msecScale));
      }
      if (!isNaN(loaded)) {
        s._whileloading(loaded, total, s._get_html5_duration());
        if (loaded && total && loaded === total) {
          html5_events.canplaythrough.call(this, e);
        }
      }
    }),
    ratechange: html5_event(function() {
    }),
    suspend: html5_event(function(e) {
      var s = this._s;
      html5_events.progress.call(this, e);
      s._onsuspend();
    }),
    stalled: html5_event(function() {
    }),
    timeupdate: html5_event(function() {
      this._s._onTimer();
    }),
    waiting: html5_event(function() {
      var s = this._s;
      s._onbufferchange(1);
    })
  };
  html5OK = function(iO) {
    var result;
    if (!iO || (!iO.type && !iO.url && !iO.serverURL)) {
      result = false;
    } else if (iO.serverURL || (iO.type && preferFlashCheck(iO.type))) {
      result = false;
    } else {
      result = ((iO.type ? html5CanPlay({type:iO.type}) : html5CanPlay({url:iO.url}) || sm2.html5Only || iO.url.match(/data\:/i)));
    }
    return result;
  };
  html5Unload = function(oAudio) {
    var url;
    if (oAudio) {
      url = (isSafari ? emptyURL : (sm2.html5.canPlayType('audio/wav') ? emptyWAV : emptyURL));
      oAudio.src = url;
      if (oAudio._called_unload !== undefined) {
        oAudio._called_load = false;
      }
    }
    if (useGlobalHTML5Audio) {
      lastGlobalHTML5URL = null;
    }
    return url;
  };
  html5CanPlay = function(o) {
    if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
      return false;
    }
    var url = (o.url || null),
        mime = (o.type || null),
        aF = sm2.audioFormats,
        result,
        offset,
        fileExt,
        item;
    if (mime && sm2.html5[mime] !== _undefined) {
      return (sm2.html5[mime] && !preferFlashCheck(mime));
    }
    if (!html5Ext) {
      html5Ext = [];
      for (item in aF) {
        if (aF.hasOwnProperty(item)) {
          html5Ext.push(item);
          if (aF[item].related) {
            html5Ext = html5Ext.concat(aF[item].related);
          }
        }
      }
      html5Ext = new RegExp('\\.('+html5Ext.join('|')+')(\\?.*)?$','i');
    }
    fileExt = (url ? url.toLowerCase().match(html5Ext) : null);
    if (!fileExt || !fileExt.length) {
      if (!mime) {
        result = false;
      } else {
        offset = mime.indexOf(';');
        fileExt = (offset !== -1?mime.substr(0,offset):mime).substr(6);
      }
    } else {
      fileExt = fileExt[1];
    }
    if (fileExt && sm2.html5[fileExt] !== _undefined) {
      result = (sm2.html5[fileExt] && !preferFlashCheck(fileExt));
    } else {
      mime = 'audio/'+fileExt;
      result = sm2.html5.canPlayType({type:mime});
      sm2.html5[fileExt] = result;
      result = (result && sm2.html5[mime] && !preferFlashCheck(mime));
    }
    return result;
  };
  testHTML5 = function() {
    if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
      sm2.html5.usingFlash = true;
      needsFlash = true;
      return false;
    }
    var a = (Audio !== _undefined ? (isOpera && opera.version() < 10 ? new Audio(null) : new Audio()) : null),
        item, lookup, support = {}, aF, i;
    function cp(m) {
      var canPlay, j,
          result = false,
          isOK = false;
      if (!a || typeof a.canPlayType !== 'function') {
        return result;
      }
      if (m instanceof Array) {
        for (i=0, j=m.length; i<j; i++) {
          if (sm2.html5[m[i]] || a.canPlayType(m[i]).match(sm2.html5Test)) {
            isOK = true;
            sm2.html5[m[i]] = true;
            sm2.flash[m[i]] = !!(m[i].match(flashMIME));
          }
        }
        result = isOK;
      } else {
        canPlay = (a && typeof a.canPlayType === 'function' ? a.canPlayType(m) : false);
        result = !!(canPlay && (canPlay.match(sm2.html5Test)));
      }
      return result;
    }
    aF = sm2.audioFormats;
    for (item in aF) {
      if (aF.hasOwnProperty(item)) {
        lookup = 'audio/' + item;
        support[item] = cp(aF[item].type);
        support[lookup] = support[item];
        if (item.match(flashMIME)) {
          sm2.flash[item] = true;
          sm2.flash[lookup] = true;
        } else {
          sm2.flash[item] = false;
          sm2.flash[lookup] = false;
        }
        if (aF[item] && aF[item].related) {
          for (i=aF[item].related.length-1; i >= 0; i--) {
            support['audio/'+aF[item].related[i]] = support[item];
            sm2.html5[aF[item].related[i]] = support[item];
            sm2.flash[aF[item].related[i]] = support[item];
          }
        }
      }
    }
    support.canPlayType = (a?cp:null);
    sm2.html5 = mixin(sm2.html5, support);
    sm2.html5.usingFlash = featureCheck();
    needsFlash = sm2.html5.usingFlash;
    return true;
  };
  strings = {
  };
  str = function() {
  };
  loopFix = function(sOpt) {
    if (fV === 8 && sOpt.loops > 1 && sOpt.stream) {
      sOpt.stream = false;
    }
    return sOpt;
  };
  policyFix = function(sOpt, sPre) {
    if (sOpt && !sOpt.usePolicyFile && (sOpt.onid3 || sOpt.usePeakData || sOpt.useWaveformData || sOpt.useEQData)) {
      sOpt.usePolicyFile = true;
    }
    return sOpt;
  };
  complain = function(sMsg) {
  };
  doNothing = function() {
    return false;
  };
  disableObject = function(o) {
    var oProp;
    for (oProp in o) {
      if (o.hasOwnProperty(oProp) && typeof o[oProp] === 'function') {
        o[oProp] = doNothing;
      }
    }
    oProp = null;
  };
  failSafely = function(bNoDisable) {
    if (bNoDisable === _undefined) {
      bNoDisable = false;
    }
    if (disabled || bNoDisable) {
      sm2.disable(bNoDisable);
    }
  };
  normalizeMovieURL = function(smURL) {
    var urlParams = null, url;
    if (smURL) {
      if (smURL.match(/\.swf(\?.*)?$/i)) {
        urlParams = smURL.substr(smURL.toLowerCase().lastIndexOf('.swf?') + 4);
        if (urlParams) {
          return smURL;
        }
      } else if (smURL.lastIndexOf('/') !== smURL.length - 1) {
        smURL += '/';
      }
    }
    url = (smURL && smURL.lastIndexOf('/') !== - 1 ? smURL.substr(0, smURL.lastIndexOf('/') + 1) : './') + sm2.movieURL;
    if (sm2.noSWFCache) {
      url += ('?ts=' + new Date().getTime());
    }
    return url;
  };
  setVersionInfo = function() {
    fV = parseInt(sm2.flashVersion, 10);
    if (fV !== 8 && fV !== 9) {
      sm2.flashVersion = fV = defaultFlashVersion;
    }
    var isDebug = (sm2.debugMode || sm2.debugFlash?'_debug.swf':'.swf');
    if (sm2.useHTML5Audio && !sm2.html5Only && sm2.audioFormats.mp4.required && fV < 9) {
      sm2.flashVersion = fV = 9;
    }
    sm2.version = sm2.versionNumber + (sm2.html5Only?' (HTML5-only mode)':(fV === 9?' (AS3/Flash 9)':' (AS2/Flash 8)'));
    if (fV > 8) {
      sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.flash9Options);
      sm2.features.buffering = true;
      sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.movieStarOptions);
      sm2.filePatterns.flash9 = new RegExp('\\.(mp3|' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
      sm2.features.movieStar = true;
    } else {
      sm2.features.movieStar = false;
    }
    sm2.filePattern = sm2.filePatterns[(fV !== 8?'flash9':'flash8')];
    sm2.movieURL = (fV === 8?'soundmanager2.swf':'soundmanager2_flash9.swf').replace('.swf', isDebug);
    sm2.features.peakData = sm2.features.waveformData = sm2.features.eqData = (fV > 8);
  };
  setPolling = function(bPolling, bHighPerformance) {
    if (!flash) {
      return false;
    }
    flash._setPolling(bPolling, bHighPerformance);
  };
  initDebug = function() {
  };
  idCheck = this.getSoundById;
  getSWFCSS = function() {
    var css = [];
    if (sm2.debugMode) {
      css.push(swfCSS.sm2Debug);
    }
    if (sm2.debugFlash) {
      css.push(swfCSS.flashDebug);
    }
    if (sm2.useHighPerformance) {
      css.push(swfCSS.highPerf);
    }
    return css.join(' ');
  };
  flashBlockHandler = function() {
    var name = str('fbHandler'),
        p = sm2.getMoviePercent(),
        css = swfCSS,
        error = {type:'FLASHBLOCK'};
    if (sm2.html5Only) {
      return false;
    }
    if (!sm2.ok()) {
      if (needsFlash) {
        sm2.oMC.className = getSWFCSS() + ' ' + css.swfDefault + ' ' + (p === null?css.swfTimedout:css.swfError);
      }
      sm2.didFlashBlock = true;
      processOnEvents({type:'ontimeout', ignoreInit:true, error:error});
      catchError(error);
    } else {
      if (sm2.oMC) {
        sm2.oMC.className = [getSWFCSS(), css.swfDefault, css.swfLoaded + (sm2.didFlashBlock?' '+css.swfUnblocked:'')].join(' ');
      }
    }
  };
  addOnEvent = function(sType, oMethod, oScope) {
    if (on_queue[sType] === _undefined) {
      on_queue[sType] = [];
    }
    on_queue[sType].push({
      'method': oMethod,
      'scope': (oScope || null),
      'fired': false
    });
  };
  processOnEvents = function(oOptions) {
    if (!oOptions) {
      oOptions = {
        type: (sm2.ok() ? 'onready' : 'ontimeout')
      };
    }
    if (!didInit && oOptions && !oOptions.ignoreInit) {
      return false;
    }
    if (oOptions.type === 'ontimeout' && (sm2.ok() || (disabled && !oOptions.ignoreInit))) {
      return false;
    }
    var status = {
          success: (oOptions && oOptions.ignoreInit?sm2.ok():!disabled)
        },
        srcQueue = (oOptions && oOptions.type?on_queue[oOptions.type]||[]:[]),
        queue = [], i, j,
        args = [status],
        canRetry = (needsFlash && !sm2.ok());
    if (oOptions.error) {
      args[0].error = oOptions.error;
    }
    for (i = 0, j = srcQueue.length; i < j; i++) {
      if (srcQueue[i].fired !== true) {
        queue.push(srcQueue[i]);
      }
    }
    if (queue.length) {
      for (i = 0, j = queue.length; i < j; i++) {
        if (queue[i].scope) {
          queue[i].method.apply(queue[i].scope, args);
        } else {
          queue[i].method.apply(this, args);
        }
        if (!canRetry) {
          queue[i].fired = true;
        }
      }
    }
    return true;
  };
  initUserOnload = function() {
    window.setTimeout(function() {
      if (sm2.useFlashBlock) {
        flashBlockHandler();
      }
      processOnEvents();
      if (typeof sm2.onload === 'function') {
        sm2.onload.apply(window);
      }
      if (sm2.waitForWindowLoad) {
        event.add(window, 'load', initUserOnload);
      }
    },1);
  };
  detectFlash = function() {
    if (hasFlash !== _undefined) {
      return hasFlash;
    }
    var hasPlugin = false, n = navigator, nP = n.plugins, obj, type, types, AX = window.ActiveXObject;
    if (nP && nP.length) {
      type = 'application/x-shockwave-flash';
      types = n.mimeTypes;
      if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) {
        hasPlugin = true;
      }
    } else if (AX !== _undefined && !ua.match(/MSAppHost/i)) {
      try {
        obj = new AX('ShockwaveFlash.ShockwaveFlash');
      } catch(e) {
        obj = null;
      }
      hasPlugin = (!!obj);
      obj = null;
    }
    hasFlash = hasPlugin;
    return hasPlugin;
  };
featureCheck = function() {
    var flashNeeded,
        item,
        formats = sm2.audioFormats,
        isSpecial = (is_iDevice && !!(ua.match(/os (1|2|3_0|3_1)\s/i)));
    if (isSpecial) {
      sm2.hasHTML5 = false;
      sm2.html5Only = true;
      if (sm2.oMC) {
        sm2.oMC.style.display = 'none';
      }
    } else {
      if (sm2.useHTML5Audio) {
        if (!sm2.html5 || !sm2.html5.canPlayType) {
          sm2.hasHTML5 = false;
        }
      }
    }
    if (sm2.useHTML5Audio && sm2.hasHTML5) {
      canIgnoreFlash = true;
      for (item in formats) {
        if (formats.hasOwnProperty(item)) {
          if (formats[item].required) {
            if (!sm2.html5.canPlayType(formats[item].type)) {
              canIgnoreFlash = false;
              flashNeeded = true;
            } else if (sm2.preferFlash && (sm2.flash[item] || sm2.flash[formats[item].type])) {
              flashNeeded = true;
            }
          }
        }
      }
    }
    if (sm2.ignoreFlash) {
      flashNeeded = false;
      canIgnoreFlash = true;
    }
    sm2.html5Only = (sm2.hasHTML5 && sm2.useHTML5Audio && !flashNeeded);
    return (!sm2.html5Only);
  };
  parseURL = function(url) {
    var i, j, urlResult = 0, result;
    if (url instanceof Array) {
      for (i=0, j=url.length; i<j; i++) {
        if (url[i] instanceof Object) {
          if (sm2.canPlayMIME(url[i].type)) {
            urlResult = i;
            break;
          }
        } else if (sm2.canPlayURL(url[i])) {
          urlResult = i;
          break;
        }
      }
      if (url[urlResult].url) {
        url[urlResult] = url[urlResult].url;
      }
      result = url[urlResult];
    } else {
      result = url;
    }
    return result;
  };
  startTimer = function(oSound) {
    if (!oSound._hasTimer) {
      oSound._hasTimer = true;
      if (!mobileHTML5 && sm2.html5PollingInterval) {
        if (h5IntervalTimer === null && h5TimerCount === 0) {
          h5IntervalTimer = setInterval(timerExecute, sm2.html5PollingInterval);
        }
        h5TimerCount++;
      }
    }
  };
  stopTimer = function(oSound) {
    if (oSound._hasTimer) {
      oSound._hasTimer = false;
      if (!mobileHTML5 && sm2.html5PollingInterval) {
        h5TimerCount--;
      }
    }
  };
  timerExecute = function() {
    var i;
    if (h5IntervalTimer !== null && !h5TimerCount) {
      clearInterval(h5IntervalTimer);
      h5IntervalTimer = null;
      return false;
    }
    for (i = sm2.soundIDs.length-1; i >= 0; i--) {
      if (sm2.sounds[sm2.soundIDs[i]].isHTML5 && sm2.sounds[sm2.soundIDs[i]]._hasTimer) {
        sm2.sounds[sm2.soundIDs[i]]._onTimer();
      }
    }
  };
  catchError = function(options) {
    options = (options !== _undefined ? options : {});
    if (typeof sm2.onerror === 'function') {
      sm2.onerror.apply(window, [{type:(options.type !== _undefined ? options.type : null)}]);
    }
    if (options.fatal !== _undefined && options.fatal) {
      sm2.disable();
    }
  };
  badSafariFix = function() {
    if (!isBadSafari || !detectFlash()) {
      return false;
    }
    var aF = sm2.audioFormats, i, item;
    for (item in aF) {
      if (aF.hasOwnProperty(item)) {
        if (item === 'mp3' || item === 'mp4') {
          sm2.html5[item] = false;
          if (aF[item] && aF[item].related) {
            for (i = aF[item].related.length-1; i >= 0; i--) {
              sm2.html5[aF[item].related[i]] = false;
            }
          }
        }
      }
    }
  };
  this._setSandboxType = function(sandboxType) {
  };
  this._externalInterfaceOK = function(swfVersion) {
    if (sm2.swfLoaded) {
      return false;
    }
    var e;
    sm2.swfLoaded = true;
    tryInitOnFocus = false;
    if (isBadSafari) {
      badSafariFix();
    }
    setTimeout(init, isIE ? 100 : 1);
  };
  createMovie = function(smID, smURL) {
    if (didAppend && appendSuccess) {
      return false;
    }
    function initMsg() {
    }
    if (sm2.html5Only) {
      setVersionInfo();
      initMsg();
      sm2.oMC = id(sm2.movieID);
      init();
      didAppend = true;
      appendSuccess = true;
      return false;
    }
    var remoteURL = (smURL || sm2.url),
    localURL = (sm2.altURL || remoteURL),
    swfTitle = 'JS/Flash audio component (SoundManager 2)',
    oTarget = getDocument(),
    extraClass = getSWFCSS(),
    isRTL = null,
    html = doc.getElementsByTagName('html')[0],
    oEmbed, oMovie, tmp, movieHTML, oEl, s, x, sClass;
    isRTL = (html && html.dir && html.dir.match(/rtl/i));
    smID = (smID === _undefined?sm2.id:smID);
    function param(name, value) {
      return '<param name="'+name+'" value="'+value+'" />';
    }
    setVersionInfo();
    sm2.url = normalizeMovieURL(overHTTP?remoteURL:localURL);
    smURL = sm2.url;
    sm2.wmode = (!sm2.wmode && sm2.useHighPerformance ? 'transparent' : sm2.wmode);
    if (sm2.wmode !== null && (ua.match(/msie 8/i) || (!isIE && !sm2.useHighPerformance)) && navigator.platform.match(/win32|win64/i)) {
      messages.push(strings.spcWmode);
      sm2.wmode = null;
    }
    oEmbed = {
      'name': smID,
      'id': smID,
      'src': smURL,
      'quality': 'high',
      'allowScriptAccess': sm2.allowScriptAccess,
      'bgcolor': sm2.bgColor,
      'pluginspage': http+'www.macromedia.com/go/getflashplayer',
      'title': swfTitle,
      'type': 'application/x-shockwave-flash',
      'wmode': sm2.wmode,
      'hasPriority': 'true'
    };
    if (sm2.debugFlash) {
      oEmbed.FlashVars = 'debug=1';
    }
    if (!sm2.wmode) {
      delete oEmbed.wmode;
    }
    if (isIE) {
      oMovie = doc.createElement('div');
      movieHTML = [
        '<object id="' + smID + '" data="' + smURL + '" type="' + oEmbed.type + '" title="' + oEmbed.title +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="' + http+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">',
        param('movie', smURL),
        param('AllowScriptAccess', sm2.allowScriptAccess),
        param('quality', oEmbed.quality),
        (sm2.wmode? param('wmode', sm2.wmode): ''),
        param('bgcolor', sm2.bgColor),
        param('hasPriority', 'true'),
        (sm2.debugFlash ? param('FlashVars', oEmbed.FlashVars) : ''),
        '</object>'
      ].join('');
    } else {
      oMovie = doc.createElement('embed');
      for (tmp in oEmbed) {
        if (oEmbed.hasOwnProperty(tmp)) {
          oMovie.setAttribute(tmp, oEmbed[tmp]);
        }
      }
    }
    initDebug();
    extraClass = getSWFCSS();
    oTarget = getDocument();
    if (oTarget) {
      sm2.oMC = (id(sm2.movieID) || doc.createElement('div'));
      if (!sm2.oMC.id) {
        sm2.oMC.id = sm2.movieID;
        sm2.oMC.className = swfCSS.swfDefault + ' ' + extraClass;
        s = null;
        oEl = null;
        if (!sm2.useFlashBlock) {
          if (sm2.useHighPerformance) {
            s = {
              'position': 'fixed',
              'width': '8px',
              'height': '8px',
              'bottom': '0px',
              'left': '0px',
              'overflow': 'hidden'
            };
          } else {
            s = {
              'position': 'absolute',
              'width': '6px',
              'height': '6px',
              'top': '-9999px',
              'left': '-9999px'
            };
            if (isRTL) {
              s.left = Math.abs(parseInt(s.left,10))+'px';
            }
          }
        }
        if (isWebkit) {
          sm2.oMC.style.zIndex = 10000;
        }
        if (!sm2.debugFlash) {
          for (x in s) {
            if (s.hasOwnProperty(x)) {
              sm2.oMC.style[x] = s[x];
            }
          }
        }
        try {
          if (!isIE) {
            sm2.oMC.appendChild(oMovie);
          }
          oTarget.appendChild(sm2.oMC);
          if (isIE) {
            oEl = sm2.oMC.appendChild(doc.createElement('div'));
            oEl.className = swfCSS.swfBox;
            oEl.innerHTML = movieHTML;
          }
          appendSuccess = true;
        } catch(e) {
          throw new Error(str('domError')+' \n'+e.toString());
        }
      } else {
        sClass = sm2.oMC.className;
        sm2.oMC.className = (sClass?sClass+' ':swfCSS.swfDefault) + (extraClass?' '+extraClass:'');
        sm2.oMC.appendChild(oMovie);
        if (isIE) {
          oEl = sm2.oMC.appendChild(doc.createElement('div'));
          oEl.className = swfCSS.swfBox;
          oEl.innerHTML = movieHTML;
        }
        appendSuccess = true;
      }
    }
    didAppend = true;
    initMsg();
    return true;
  };
  initMovie = function() {
    if (sm2.html5Only) {
      createMovie();
      return false;
    }
    if (flash) {
      return false;
    }
    if (!sm2.url) {
       return false;
    }
    flash = sm2.getMovie(sm2.id);
    if (!flash) {
      if (!oRemoved) {
        createMovie(sm2.id, sm2.url);
      } else {
        if (!isIE) {
          sm2.oMC.appendChild(oRemoved);
        } else {
          sm2.oMC.innerHTML = oRemovedHTML;
        }
        oRemoved = null;
        didAppend = true;
      }
      flash = sm2.getMovie(sm2.id);
    }
    if (typeof sm2.oninitmovie === 'function') {
      setTimeout(sm2.oninitmovie, 1);
    }
    return true;
  };
  delayWaitForEI = function() {
    setTimeout(waitForEI, 1000);
  };
  rebootIntoHTML5 = function() {
    window.setTimeout(function() {
      sm2.setup({
        preferFlash: false
      }).reboot();
      sm2.didFlashBlock = true;
      sm2.beginDelayedInit();
    }, 1);
  };
  waitForEI = function() {
    var p,
        loadIncomplete = false;
    if (!sm2.url) {
      return false;
    }
    if (waitingForEI) {
      return false;
    }
    waitingForEI = true;
    event.remove(window, 'load', delayWaitForEI);
    if (hasFlash && tryInitOnFocus && !isFocused) {
      return false;
    }
    if (!didInit) {
      p = sm2.getMoviePercent();
      if (p > 0 && p < 100) {
        loadIncomplete = true;
      }
    }
    setTimeout(function() {
      p = sm2.getMoviePercent();
      if (loadIncomplete) {
        waitingForEI = false;
        window.setTimeout(delayWaitForEI, 1);
        return false;
      }
      if (!didInit && okToDisable) {
        if (p === null) {
          if (sm2.useFlashBlock || sm2.flashLoadTimeout === 0) {
            if (sm2.useFlashBlock) {
              flashBlockHandler();
            }
          } else {
            if (!sm2.useFlashBlock && canIgnoreFlash) {
              rebootIntoHTML5();
            } else {
              processOnEvents({type:'ontimeout', ignoreInit: true, error: {type: 'INIT_FLASHBLOCK'}});
            }
          }
        } else {
          if (sm2.flashLoadTimeout === 0) {
          } else {
            if (!sm2.useFlashBlock && canIgnoreFlash) {
              rebootIntoHTML5();
            } else {
              failSafely(true);
            }
          }
        }
      }
    }, sm2.flashLoadTimeout);
  };
  handleFocus = function() {
    function cleanup() {
      event.remove(window, 'focus', handleFocus);
    }
    if (isFocused || !tryInitOnFocus) {
      cleanup();
      return true;
    }
    okToDisable = true;
    isFocused = true;
    waitingForEI = false;
    delayWaitForEI();
    cleanup();
    return true;
  };
  flushMessages = function() {
  };
  showSupport = function() {
  };
  initComplete = function(bNoDisable) {
    if (didInit) {
      return false;
    }
    if (sm2.html5Only) {
      didInit = true;
      initUserOnload();
      return true;
    }
    var wasTimeout = (sm2.useFlashBlock && sm2.flashLoadTimeout && !sm2.getMoviePercent()),
        result = true,
        error;
    if (!wasTimeout) {
      didInit = true;
    }
    error = {type: (!hasFlash && needsFlash ? 'NO_FLASH' : 'INIT_TIMEOUT')};
    if (disabled || bNoDisable) {
      if (sm2.useFlashBlock && sm2.oMC) {
        sm2.oMC.className = getSWFCSS() + ' ' + (sm2.getMoviePercent() === null?swfCSS.swfTimedout:swfCSS.swfError);
      }
      processOnEvents({type:'ontimeout', error:error, ignoreInit: true});
      catchError(error);
      result = false;
    } else {
    }
    if (!disabled) {
      if (sm2.waitForWindowLoad && !windowLoaded) {
        event.add(window, 'load', initUserOnload);
      } else {
        initUserOnload();
      }
    }
    return result;
  };
  setProperties = function() {
    var i,
        o = sm2.setupOptions;
    for (i in o) {
      if (o.hasOwnProperty(i)) {
        if (sm2[i] === _undefined) {
          sm2[i] = o[i];
        } else if (sm2[i] !== o[i]) {
          sm2.setupOptions[i] = sm2[i];
        }
      }
    }
  };
  init = function() {
    if (didInit) {
      return false;
    }
    function cleanup() {
      event.remove(window, 'load', sm2.beginDelayedInit);
    }
    if (sm2.html5Only) {
      if (!didInit) {
        cleanup();
        sm2.enabled = true;
        initComplete();
      }
      return true;
    }
    initMovie();
    try {
      flash._externalInterfaceTest(false);
      setPolling(true, (sm2.flashPollingInterval || (sm2.useHighPerformance ? 10 : 50)));
      if (!sm2.debugMode) {
        flash._disableDebug();
      }
      sm2.enabled = true;
      if (!sm2.html5Only) {
        event.add(window, 'unload', doNothing);
      }
    } catch(e) {
      catchError({type:'JS_TO_FLASH_EXCEPTION', fatal:true});
      failSafely(true);
      initComplete();
      return false;
    }
    initComplete();
    cleanup();
    return true;
  };
  domContentLoaded = function() {
    if (didDCLoaded) {
      return false;
    }
    didDCLoaded = true;
    setProperties();
    initDebug();
    if (!hasFlash && sm2.hasHTML5) {
      sm2.setup({
        'useHTML5Audio': true,
        'preferFlash': false
      });
    }
    testHTML5();
    if (!hasFlash && needsFlash) {
      messages.push(strings.needFlash);
      sm2.setup({
        'flashLoadTimeout': 1
      });
    }
    if (doc.removeEventListener) {
      doc.removeEventListener('DOMContentLoaded', domContentLoaded, false);
    }
    initMovie();
    return true;
  };
  domContentLoadedIE = function() {
    if (doc.readyState === 'complete') {
      domContentLoaded();
      doc.detachEvent('onreadystatechange', domContentLoadedIE);
    }
    return true;
  };
  winOnLoad = function() {
    windowLoaded = true;
    domContentLoaded();
    event.remove(window, 'load', winOnLoad);
  };
  preInit = function() {
    if (mobileHTML5) {
      sm2.setupOptions.useHTML5Audio = true;
      sm2.setupOptions.preferFlash = false;
      if (is_iDevice || (isAndroid && !ua.match(/android\s2\.3/i))) {
        if (is_iDevice) {
          sm2.ignoreFlash = true;
        }
        useGlobalHTML5Audio = true;
      }
    }
  };
  preInit();
  detectFlash();
  event.add(window, 'focus', handleFocus);
  event.add(window, 'load', delayWaitForEI);
  event.add(window, 'load', winOnLoad);
  if (doc.addEventListener) {
    doc.addEventListener('DOMContentLoaded', domContentLoaded, false);
  } else if (doc.attachEvent) {
    doc.attachEvent('onreadystatechange', domContentLoadedIE);
  } else {
    catchError({type:'NO_DOM2_EVENTS', fatal:true});
  }
}
// SM2_DEFER details: http://www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading
if (window.SM2_DEFER === undefined || !SM2_DEFER) {
  soundManager = new SoundManager();
}
if (typeof module === 'object' && module && typeof module.exports === 'object') {
  window.soundManager = soundManager;
  module.exports.SoundManager = SoundManager;
  module.exports.soundManager = soundManager;
} else if (typeof define === 'function' && define.amd) {
  define('SoundManager', [], function() {
    return {
      SoundManager: SoundManager,
      soundManager: soundManager
    };
  });
} else {
  window.SoundManager = SoundManager;
  window.soundManager = soundManager;
}
}(window));

(function(w) {
if (w.fastXDM) return;

var handlers = {};
var onEnvLoad = [];
var env = {};

// Key generation
function genKey() {
  var key = '';
  for (i=0;i<5;i++) key += Math.ceil(Math.random()*15).toString(16);
  return key;
}
function waitFor(obj, prop, func, self,  count) {
  if (obj[prop]) {
     func.apply(self);
  } else {
    count = count || 0;
    if (count < 1000) setTimeout(function() {
      waitFor(obj, prop, func, self, count + 1)
    }, 0);
  }
}
function attachScript(url) {
  setTimeout(function() {
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = url || w.fastXDM.helperUrl;
    waitFor(document, 'body', function() {
      document.getElementsByTagName('HEAD')[0].appendChild(newScript);
    });
  }, 0);
}

function walkVar(value, clean) {
  switch (typeof value) {
    case 'string':
      if (clean) {
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
      }
      return value.replace(/&#039;/g, '\'').replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');

    case 'object':
      if (Object.prototype.toString.apply(value) === '[object Array]') {
        newValue = [];
        for (var i = 0; i < value.length; i++) {
          newValue[i] = walkVar(value[i], clean);
        }
      } else {
        for (var k in value) {
          newValue = {};
          if (Object.hasOwnProperty.call(value, k)) {
            newValue[k] = walkVar(value[k], clean);
          }
        }
      }
    default:
      newValue = value;
  }

  return newValue;
}

// Env functions
function getEnv(callback, self) {
  if (env.loaded) {
    callback.apply(self, [env]);
  } else {
    onEnvLoad.push([self, callback]);
  }
}

function envLoaded() {
  env.loaded = true;
  var i = onEnvLoad.length;
  while (i--) {
    onEnvLoad[i][1].apply(onEnvLoad[i][0], [env]);
  }
}

function applyMethod(strData, self) {
  getEnv(function(env) {
    var data = env.json.parse(strData);
    if (data[0]) {
      if (!data[1]) data[1] = [];
      var i = data[1].length;
      while (i--) {
        if (data[1][i]._func) {
          var funcNum = data[1][i]._func;
          data[1][i] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('_func'+funcNum);
            self.callMethod.apply(self, args);
          }
        } else if (self.options.safe) {
          data[1][i] = walkVar(data[1][i], true);
        }
      }
      setTimeout(function() {
        if (!self.methods[data[0]]) {
          throw Error('fastXDM: Method ' + data[0] + ' is undefined');
        }
        self.methods[data[0]].apply(self, data[1]);
      }, 0);
    }
  });
}

// XDM object
w.fastXDM = {
  _id: 0,
  helperUrl: ((location.protocol === 'https:') ? 'https:' : 'http:') + '//vk.com/js/api/xdmHelper.js',

  Server: function(methods, filter, options) {
    this.methods = methods || {};
    this.id = w.fastXDM._id++;
    this.options = options || {};
    this.filter = filter;
    this.key = genKey();
    this.methods['%init%'] = this.methods.__fxdm_i = function() {
      w.fastXDM.run(this.id);
      if (this.methods.onInit) this.methods.onInit();
    };
    this.frameName = 'fXD'+this.key;
    this.server = true;
    handlers[this.key] = [applyMethod, this];
  },

  Client: function(methods, options) {
    this.methods = methods || {};
    this.id = w.fastXDM._id++;
    this.options = options || {};
    w.fastXDM.run(this.id);
    if (window.name.indexOf('fXD') === 0) {
      this.key = window.name.substr(3);
    } else {
      throw Error('Wrong window.name property.');
    }
    this.caller = window.parent;
    handlers[this.key] = [applyMethod, this];
    this.client = true;

    w.fastXDM.on('helper', function() {
      w.fastXDM.onClientStart(this);
    }, this);

    getEnv(function(env) {
      env.send(this, env.json.stringify(['%init%']));
      var methods = this.methods;
      setTimeout(function() {
        if (methods.onInit) methods.onInit();
      }, 0);
    }, this);
  },

  onMessage: function(e) {
    if (!e.data) return false;
    var key = e.data.substr(0, 5);
    if (handlers[key]) {
      var self = handlers[key][1];
      if (self && (!self.filter || self.filter(e.origin))) {
        handlers[key][0](e.data.substr(6), self);
      }
    }
  },

  setJSON: function(json) {
    env.json = json;
  },

  getJSON: function(callback) {
    if (!callback) return env.json;
    getEnv(function(env) {
      callback(env.json);
    });
  },

  setEnv: function(exEnv) {
    var i;
    for (i in exEnv) {
      env[i] = exEnv[i];
    }
    envLoaded();
  },

  _q: {},

  on: function(key, act, self) {
    if (!this._q[key]) this._q[key] = [];
    if (this._q[key] == -1) {
      act.apply(self);
    } else {
      this._q[key].push([act, self]);
    }
  },

  run: function(key) {
    var len = (this._q[key] || []).length;
    if (this._q[key] && len > 0) {
      for (var i = 0; i < len; i++) this._q[key][i][0].apply(this._q[key][i][1]);
    }
    this._q[key] = -1;
  },

  waitFor: waitFor
}

w.fastXDM.Server.prototype.start = function(obj, count) {
  if (obj.contentWindow) {
    this.caller = obj.contentWindow;
    this.frame = obj;

    w.fastXDM.on('helper', function() {
      w.fastXDM.onServerStart(this);
    }, this);

  } else { // Opera old versions
    var self = this;
    count = count || 0;
    if (count < 50) setTimeout(function() {
      self.start.apply(self, [obj, count+1]);
    }, 100);
  }
}

w.fastXDM.Server.prototype.destroy = function() {
  handlers.splice(handlers.indexOf(this.key), 1);
}

function extend(obj1, obj2){
  for (var i in obj2) {
    if (obj1[i] && typeof(obj1[i]) == 'object') {
      extend(obj1[i], obj2[i])
    } else {
      obj1[i] = obj2[i];
    }
  }
}

w.fastXDM.Server.prototype.append = function(obj, options) {
  var div = document.createElement('DIV');
  div.innerHTML = '<iframe name="'+this.frameName+'" ></iframe>';
  var frame = div.firstChild;
  var self = this;
  setTimeout(function() {
    frame.frameBorder = '0';
    if (options) extend(frame, options);
    obj.insertBefore(frame, obj.firstChild);
    self.start(frame);
  }, 0);
  return frame;
}

w.fastXDM.Client.prototype.callMethod = w.fastXDM.Server.prototype.callMethod = function() {
  var args = Array.prototype.slice.call(arguments);
  var method = args.shift();
  var i = args.length;
  while (i--) {
    if (typeof(args[i]) == 'function') {
      this.funcsCount = (this.funcsCount || 0) + 1;
      var func = args[i];
      var funcName = '_func' + this.funcsCount;
      this.methods[funcName] = function() {
        func.apply(this, arguments);
        delete this.methods[funcName];
      }
      args[i] = {_func: this.funcsCount};
    } else if (this.options.safe) {
      args[i] = walkVar(args[i], false);
    }
  }
  waitFor(this, 'caller', function() {
    w.fastXDM.on(this.id, function() {
      getEnv(function(env) {
        env.send(this, env.json.stringify([method, args]));
      }, this);
    }, this);
  }, this);
}

if (w.JSON && typeof(w.JSON) == 'object' && w.JSON.parse && w.JSON.stringify && w.JSON.stringify({a:[1,2,3]}).replace(/ /g, '') == '{"a":[1,2,3]}') {
  env.json = {parse: w.JSON.parse, stringify: w.JSON.stringify};
} else {
  w.fastXDM._needJSON = true;
}

// PostMessage cover
if (w.postMessage) {
  env.protocol = 'p';
  env.send = function(xdm, strData) {
    var win = (xdm.frame ? xdm.frame.contentWindow : xdm.caller);
    win.postMessage(xdm.key+':'+strData, "*");
  }
  if (w.addEventListener) {
    w.addEventListener("message", w.fastXDM.onMessage, false);
  } else {
    w.attachEvent("onmessage", w.fastXDM.onMessage);
  }

  if (w.fastXDM._needJSON) {
    w.fastXDM._onlyJSON = true;
    attachScript();
  } else {
    envLoaded();
  }
} else {
  attachScript();
}
})(window);


if (!window.VK) window.VK = {};


/*
 * Based on JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 */
if(!VK.MD5){VK.MD5=function(n){var j=function(o,r){var q=(o&65535)+(r&65535),p=(o>>16)+(r>>16)+(q>>16);return(p<<16)|(q&65535)},g=function(o,p){return(o<<p)|(o>>>(32-p))},k=function(w,r,p,o,v,u){return j(g(j(j(r,w),j(o,u)),v),p)},a=function(q,p,w,v,o,u,r){return k((p&w)|((~p)&v),q,p,o,u,r)},h=function(q,p,w,v,o,u,r){return k((p&v)|(w&(~v)),q,p,o,u,r)},c=function(q,p,w,v,o,u,r){return k(p^w^v,q,p,o,u,r)},m=function(q,p,w,v,o,u,r){return k(w^(p|(~v)),q,p,o,u,r)},b=function(A,u){var z=1732584193,y=-271733879,w=-1732584194,v=271733878,r,q,p,o;A[u>>5]|=128<<((u)%32);A[(((u+64)>>>9)<<4)+14]=u;for(var t=0,s=A.length;t<s;t+=16){r=z;q=y;p=w;o=v;z=a(z,y,w,v,A[t+0],7,-680876936);v=a(v,z,y,w,A[t+1],12,-389564586);w=a(w,v,z,y,A[t+2],17,606105819);y=a(y,w,v,z,A[t+3],22,-1044525330);z=a(z,y,w,v,A[t+4],7,-176418897);v=a(v,z,y,w,A[t+5],12,1200080426);w=a(w,v,z,y,A[t+6],17,-1473231341);y=a(y,w,v,z,A[t+7],22,-45705983);z=a(z,y,w,v,A[t+8],7,1770035416);v=a(v,z,y,w,A[t+9],12,-1958414417);w=a(w,v,z,y,A[t+10],17,-42063);y=a(y,w,v,z,A[t+11],22,-1990404162);z=a(z,y,w,v,A[t+12],7,1804603682);v=a(v,z,y,w,A[t+13],12,-40341101);w=a(w,v,z,y,A[t+14],17,-1502002290);y=a(y,w,v,z,A[t+15],22,1236535329);z=h(z,y,w,v,A[t+1],5,-165796510);v=h(v,z,y,w,A[t+6],9,-1069501632);w=h(w,v,z,y,A[t+11],14,643717713);y=h(y,w,v,z,A[t+0],20,-373897302);z=h(z,y,w,v,A[t+5],5,-701558691);v=h(v,z,y,w,A[t+10],9,38016083);w=h(w,v,z,y,A[t+15],14,-660478335);y=h(y,w,v,z,A[t+4],20,-405537848);z=h(z,y,w,v,A[t+9],5,568446438);v=h(v,z,y,w,A[t+14],9,-1019803690);w=h(w,v,z,y,A[t+3],14,-187363961);y=h(y,w,v,z,A[t+8],20,1163531501);z=h(z,y,w,v,A[t+13],5,-1444681467);v=h(v,z,y,w,A[t+2],9,-51403784);w=h(w,v,z,y,A[t+7],14,1735328473);y=h(y,w,v,z,A[t+12],20,-1926607734);z=c(z,y,w,v,A[t+5],4,-378558);v=c(v,z,y,w,A[t+8],11,-2022574463);w=c(w,v,z,y,A[t+11],16,1839030562);y=c(y,w,v,z,A[t+14],23,-35309556);z=c(z,y,w,v,A[t+1],4,-1530992060);v=c(v,z,y,w,A[t+4],11,1272893353);w=c(w,v,z,y,A[t+7],16,-155497632);y=c(y,w,v,z,A[t+10],23,-1094730640);z=c(z,y,w,v,A[t+13],4,681279174);v=c(v,z,y,w,A[t+0],11,-358537222);w=c(w,v,z,y,A[t+3],16,-722521979);y=c(y,w,v,z,A[t+6],23,76029189);z=c(z,y,w,v,A[t+9],4,-640364487);v=c(v,z,y,w,A[t+12],11,-421815835);w=c(w,v,z,y,A[t+15],16,530742520);y=c(y,w,v,z,A[t+2],23,-995338651);z=m(z,y,w,v,A[t+0],6,-198630844);v=m(v,z,y,w,A[t+7],10,1126891415);w=m(w,v,z,y,A[t+14],15,-1416354905);y=m(y,w,v,z,A[t+5],21,-57434055);z=m(z,y,w,v,A[t+12],6,1700485571);v=m(v,z,y,w,A[t+3],10,-1894986606);w=m(w,v,z,y,A[t+10],15,-1051523);y=m(y,w,v,z,A[t+1],21,-2054922799);z=m(z,y,w,v,A[t+8],6,1873313359);v=m(v,z,y,w,A[t+15],10,-30611744);w=m(w,v,z,y,A[t+6],15,-1560198380);y=m(y,w,v,z,A[t+13],21,1309151649);z=m(z,y,w,v,A[t+4],6,-145523070);v=m(v,z,y,w,A[t+11],10,-1120210379);w=m(w,v,z,y,A[t+2],15,718787259);y=m(y,w,v,z,A[t+9],21,-343485551);z=j(z,r);y=j(y,q);w=j(w,p);v=j(v,o)}return[z,y,w,v]},f=function(r){var q="",s=-1,p=r.length,o,t;while(++s<p){o=r.charCodeAt(s);t=s+1<p?r.charCodeAt(s+1):0;if(55296<=o&&o<=56319&&56320<=t&&t<=57343){o=65536+((o&1023)<<10)+(t&1023);s++}if(o<=127){q+=String.fromCharCode(o)}else{if(o<=2047){q+=String.fromCharCode(192|((o>>>6)&31),128|(o&63))}else{if(o<=65535){q+=String.fromCharCode(224|((o>>>12)&15),128|((o>>>6)&63),128|(o&63))}else{if(o<=2097151){q+=String.fromCharCode(240|((o>>>18)&7),128|((o>>>12)&63),128|((o>>>6)&63),128|(o&63))}}}}}return q},e=function(p){var o=Array(p.length>>2),r,q;for(r=0,q=o.length;r<q;r++){o[r]=0}for(r=0,q=p.length*8;r<q;r+=8){o[r>>5]|=(p.charCodeAt(r/8)&255)<<(r%32)}return o},l=function(p){var o="";for(var r=0,q=p.length*32;r<q;r+=8){o+=String.fromCharCode((p[r>>5]>>>(r%32))&255)}return o},d=function(o){return l(b(e(o),o.length*8))},i=function(q){var t="0123456789abcdef",p="",o;for(var s=0,r=q.length;s<r;s++){o=q.charCodeAt(s);p+=t.charAt((o>>>4)&15)+t.charAt(o&15)}return p};return i(d(f(n)))}}

/*
 * VKontakte Open API JavaScript library
 * http://vk.com/
 */

VK.extend = function(target, source, overwrite) {
  for (var key in source) {
    if (overwrite || typeof target[key] === 'undefined') {
      target[key] = source[key];
    }
  }
  return target;
};

if (VK._protocol !== 'https:') {
  VK._protocol = ((location.protocol === 'https:') ? 'https:' : 'http:');
}

if (!VK.xdConnectionCallbacks) {

VK.extend(VK, {
  version: 1,
  _apiId: null,
  _session: null,
  _userStatus: 'unknown',
  _domain: {
    main: 'https://oauth.vk.com/',
    api: 'https://api.vk.com/'
  },
  _path: {
    login: 'authorize',
    proxy: 'fxdm_oauth_proxy.html'
  },
  _rootId: 'vk_api_transport',
  _nameTransportPath: '',
  xdReady: false,
  access: {
    FRIENDS:   0x2,
    PHOTOS:    0x4,
    AUDIO:     0x8,
    VIDEO:     0x10,
    MATCHES:   0x20,
    QUESTIONS: 0x40,
    WIKI:      0x80
  }
});

VK.init = function(options) {
  var body, root;

  VK._apiId = null;
  if (!options.apiId) {
    throw Error('VK.init() called without an apiId');
  }
  VK._apiId = options.apiId;

  if (options.onlyWidgets) return true;

  if (options.nameTransportPath && options.nameTransportPath !== '') {
    VK._nameTransportPath = options.nameTransportPath;
  }

  root = document.getElementById(VK._rootId);
  if (!root) {
    root = document.createElement('div');
    root.id = VK._rootId;
    body = document.getElementsByTagName('body')[0];
    body.insertBefore(root, body.childNodes[0]);
  }
  root.style.position = 'absolute';
  root.style.top = '-10000px';

  var session = VK.Cookie.load();
  if (session) {
    VK.Auth._loadState = 'loaded';
    VK.Auth.setSession(session, session ? 'connected' : 'unknown');
  }
};

if (!VK.Cookie) {
VK.Cookie = {
  _domain: null,
  load: function() {
    var
      cookie = document.cookie.match('\\bvk_app_' + VK._apiId + '=([^;]*)\\b'),
      session;

    if (cookie) {
      session = this.decode(cookie[1]);
      if (session.secret != 'oauth') {
        return false;
      }
      session.expire = parseInt(session.expire, 10);
      VK.Cookie._domain = '.' + window.location.hostname;//session.base_domain;
    }

    return session;
  },
  setRaw: function(val, ts, domain, time) {
    var rawCookie;
    rawCookie = 'vk_app_' + VK._apiId + '=' + val + '';
    var exp = time ? (new Date().getTime() + time * 1000) : ts * 1000;
    rawCookie += (val && ts === 0 ? '' : '; expires=' + new Date(exp).toGMTString());
    rawCookie += '; path=/';
    rawCookie += (domain ? '; domain=.' + domain : '');
    document.cookie = rawCookie;

    this._domain = domain;
  },
  set: function(session, resp) {
    if (session) {
      this.setRaw(this.encode(session), session.expire, window.location.hostname, (resp || {}).time);
    } else {
      this.clear();
    }
  },
  clear: function() {
    this.setRaw('', 0, this._domain, 0);
  },
  encode: function(params) {
    var
      pairs = [],
      key;

    for (key in params) {
      if (key != 'user') pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
    pairs.sort();

    return pairs.join('&');
  },
  decode: function(str) {
    var
      params = {},
      parts = str.split('&'),
      i,
      pair;

    for (i=0; i < parts.length; i++) {
      pair = parts[i].split('=', 2);
      if (pair && pair[0]) {
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }

    return params;
  }
};
}

if (!VK.Api) {
VK.Api = {
  _headId: null,
  _callbacks: {},
  ie6_7: function() {
    if (!VK.Api.ieTested) {
      VK.Api.isIE6_7 = navigator.userAgent.match(/MSIE [6|7]/i);
      VK.Api.ieTested = true;
    }
    return VK.Api.isIE6_7;
  },
  attachScript: function(url) {
    if (!VK.Api._headId) VK.Api._headId = document.getElementsByTagName("head")[0];
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.setAttribute('encoding', 'UTF-8');
    newScript.src = url;
    VK.Api._headId.appendChild(newScript);
  },
  checkMethod: function(method, params, cb, queryTry) {
    var m = method.toLowerCase();
    if (m == 'wall.post' || m == 'activity.set') {
      var text = (m == 'activity.set') ? params.text : params.message;
      var query =  VK._protocol + '//vk.com/al_apps.php?act=wall_post_box&widget=1&method='+m+'&aid=' + parseInt(VK._apiId, 10) + '&text=' + encodeURIComponent(text);
      if (m == 'wall.post') {
        query += '&owner_id=' + parseInt(params.owner_id || 0, 10) + '&attachments=' + (params.attachments || params.attachment || '');
      }
      var method_access = '_'+(Math.random()).toString(16).substr(2);
      query += '&method_access='+method_access;
      var popup = VK.UI.popup({
        url: query,
        width: 460,
        height: 249
      });
      var timer = setInterval(function() {
        if (VK.UI.active.closed) {
          clearInterval(timer);
          params.method_access = method_access;
          VK.Api.call(method, params, cb, queryTry);
        }
      }, 500);
      return false;
    }
    return true;
  },
  call: function(method, params, cb, queryTry) {
    var
      query = params || {},
      qs,
      responseCb;

    if (typeof query != 'object' || typeof cb != 'function') {
      return false;
    }
    if (!params.method_access && !params.method_force && !VK.Api.checkMethod(method, params, cb, queryTry)) {
      return;
    }

    if (!queryTry) queryTry = 0;

    if (VK.Auth._loadState != 'loaded') {
      var authFunc = function(result) {
        if (result && result.session) {
          VK.Observer.unsubscribe('auth.loginStatus', authFunc);
          VK.Api.call(method, params, cb);
        }
      };
      VK.Observer.subscribe('auth.loginStatus', authFunc);
      VK.Auth.getLoginStatus();
      return;
    }

    if (VK.Api.queryLength(query) < 1500 && !VK.Api.ie6_7()) {
      var useXDM = false;
      var rnd = parseInt(Math.random() * 10000000, 10);
      while (VK.Api._callbacks[rnd]) {
        rnd = parseInt(Math.random() * 10000000, 10)
      }
      query.callback = 'VK.Api._callbacks['+rnd+']';
    } else {
      var useXDM = true;
    }

    if (VK._session && VK._session.sid) {
      query.access_token = VK._session.sid;
    }

    qs = VK.Cookie.encode(query);

    responseCb = function(response) {
      if (response.error && (response.error.error_code == 3 || response.error.error_code == 4 || response.error.error_code == 5)) {
        if (queryTry > 3) return false;
        var repeatCall = function(resp) {
          VK.Observer.unsubscribe('auth.sessionChange', repeatCall);
          delete params.access_token;
          if (resp.session) VK.Api.call(method, params, cb, queryTry + 1);
        }
        VK.Observer.subscribe('auth.sessionChange', repeatCall);
        VK.Auth.getLoginStatus();
      } else {
        cb(response);
      }
      if (!useXDM) delete VK.Api._callbacks[rnd];
    };

    if (useXDM) {
      if (VK.xdReady) {
        VK.XDM.remote.callMethod('apiCall', method, qs, responseCb);
      } else {
        VK.Observer.subscribe('xdm.init', function() {
          VK.XDM.remote.callMethod('apiCall', method, qs, responseCb);
        });
        VK.XDM.init();
      }
    } else {
      VK.Api._callbacks[rnd] = responseCb;
      VK.Api.attachScript(VK._domain.api + 'method/' + method +'?' + qs);
    }
  },
  queryLength: function(query) {
    var len = 100, i; // sid + sig
    for (i in query) {
      len += i.length + encodeURIComponent(query.i).length + 1;
    }
    return len;
  }
};

// Alias
VK.api = function(method, params, cb) {VK.Api.call(method, params, cb);}
};

if (!VK.Auth) {
VK.Auth = {
  popup: null,
  lsCb: {},
  setSession: function(session, status, settings, resp) {
    var
      login = !VK._session && session,
      logout = VK._session && !session,
      both = VK._session && session && VK._session.mid != session.mid,
      sessionChange = login || logout || (VK._session && session && VK._session.sid != session.sid),
      statusChange = status != VK._userStatus,
      response = {
        'session': session,
        'status': status,
        'settings': settings
      };

    VK._session = session;

    VK._userStatus = status;

    VK.Cookie.set(session, resp);

    if (sessionChange || statusChange || both) {
      setTimeout(function() {
        if (statusChange) {
          VK.Observer.publish('auth.statusChange', response);
        }

        if (logout || both) {
          VK.Observer.publish('auth.logout', response);
        }

        if (login || both) {
          VK.Observer.publish('auth.login', response);
        }

        if (sessionChange) {
          VK.Observer.publish('auth.sessionChange', response);
        }
      }, 0);
    }

    return response;
  },
  // Public VK.Auth methods
  login: function(cb, settings) {
    var channel, url;
    if (!VK._apiId) {
      return false;
    }
    channel = window.location.protocol + '//' + window.location.hostname;
    url = VK._domain.main + VK._path.login + '?client_id='+VK._apiId+'&display=popup&redirect_uri=close.html&response_type=token';
    if (settings && parseInt(settings, 10) > 0) {
      url += '&scope=' + settings;
    }
    VK.Observer.unsubscribe('auth.onLogin');
    VK.Observer.subscribe('auth.onLogin', cb);
    VK.UI.popup({
      width: 620,
      height: 370,
      url: url
    });
    var authCallback = function() {
      VK.Auth.getLoginStatus(function(resp) {
        VK.Observer.publish('auth.onLogin', resp);
        VK.Observer.unsubscribe('auth.onLogin');
      }, true);
    }

    VK.UI.popupOpened = true;
    var popupCheck = function() {
      if (!VK.UI.popupOpened) return false;
      try {
        if (!VK.UI.active.top || VK.UI.active.closed) {
          VK.UI.popupOpened = false;
          authCallback();
          return true;
        }
      } catch(e) {
        VK.UI.popupOpened = false;
        authCallback();
        return true;
      }
      setTimeout(popupCheck, 100);
    };

    setTimeout(popupCheck, 100);
  },
  // Logout user from app, vk.com & login.vk.com
  logout: function(cb) {
    VK.Auth.revokeGrants(cb);
  },
  revokeGrants: function(cb) {
    var onLogout = function(resp) {
      VK.Observer.unsubscribe('auth.statusChange', onLogout);
      if (cb) cb(resp);
    }
    VK.Observer.subscribe('auth.statusChange', onLogout);
    if (VK._session && VK._session.sid) VK.Api.attachScript('https://login.vk.com/?act=openapi&oauth=1&aid=' + parseInt(VK._apiId, 10) + '&location=' + encodeURIComponent(window.location.hostname)+'&do_logout=1&token='+VK._session.sid);
    VK.Cookie.clear();
  },
  // Get current login status from session (sync) (not use on load time)
  getSession: function() {
    return VK._session;
  },
  // Get current login status from vk.com (async)
  getLoginStatus: function(cb, force) {
    if (!VK._apiId) {
      return;
    }

    if (cb) {
      if (!force && VK.Auth._loadState == 'loaded') {
        cb({status: VK._userStatus, session: VK._session});
        return;
      } else {
        VK.Observer.subscribe('auth.loginStatus', cb);
      }
    }

    if (!force && VK.Auth._loadState == 'loading') {
      return;
    }

    VK.Auth._loadState = 'loading';
    var rnd = parseInt(Math.random() * 10000000, 10);
    while (VK.Auth.lsCb[rnd]) {
      rnd = parseInt(Math.random() * 10000000, 10)
    }
    VK.Auth.lsCb[rnd] = function(response) {
      delete VK.Auth.lsCb[rnd];
      VK.Auth._loadState = 'loaded';
      if (response && response.auth) {
        var session = {
          mid: response.user.id,
          sid: response.access_token,
          sig: response.sig,
          secret: response.secret,
          expire: response.expire
        };
        if (force) session.user = response.user;
        var status = 'connected';
      } else {
        var session = null;
        var status = response.user ? 'logined' : 'unknown';
        VK.Cookie.clear();
      }
      VK.Auth.setSession(session, status, false, response);
      VK.Observer.publish('auth.loginStatus', {session: session, status: status});
      VK.Observer.unsubscribe('auth.loginStatus');
    };
    // AttachScript here
    VK.Api.attachScript('https://login.vk.com/?act=openapi&oauth=1&aid=' + parseInt(VK._apiId, 10) + '&location=' + encodeURIComponent(window.location.hostname)+'&rnd='+rnd);
  }
};
}

} else { // if VK.xdConnectionCallbacks
  setTimeout(function() {
    var callback;
    while (callback = VK.xdConnectionCallbacks.pop()) {
      callback();
    }
  }, 0);
  if (VK.Widgets && !VK.Widgets._constructor) {
    VK.Widgets = false;
  }
}

if (!VK.UI) {
VK.UI = {
  active: null,
  _buttons: [],
  popup: function(options) {
    var
      screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
      screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
      outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
      outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.body.clientHeight - 22),
      width = options.width,
      height = options.height,
      left = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features = (
        'width=' + width +
        ',height=' + height +
        ',left=' + left +
        ',top=' + top
      );
      this.active = window.open(options.url, 'vk_openapi', features);
  },
  button: function(el, handler) {
    var html = '';

    if (typeof el == 'string') {
      el = document.getElementById(el);
    }


    this._buttons.push(el);
    index = this._buttons.length - 1;

    html = (
      '<table cellspacing="0" cellpadding="0" id="openapi_UI_' + index + '" onmouseover="VK.UI._change(1, ' + index + ');" onmouseout="VK.UI._change(0, ' + index + ');" onmousedown="VK.UI._change(2, ' + index + ');" onmouseup="VK.UI._change(1, ' + index + ');" style="cursor: pointer; border: 0px; font-family: tahoma, arial, verdana, sans-serif, Lucida Sans; font-size: 10px;"><tr style="vertical-align: middle">' +
      '<td><div style="border: 1px solid #3b6798;border-radius: 2px 0px 0px 2px;-moz-border-radius: 2px 0px 0px 2px;-webkit-border-radius: 2px 0px 0px 2px;"><div style="border: 1px solid #5c82ab; border-top-color: #7e9cbc; background-color: #6D8DB1; color: #fff; text-shadow: 0px 1px #45688E; height: 15px; padding: 2px 4px 0px 6px;line-height: 13px;">&#1042;&#1086;&#1081;&#1090;&#1080;</div></div></td>' +
      '<td><div style="background: url(' + VK._protocol + '//vk.com/images/btns.png) 0px -42px no-repeat; width: 21px; height: 21px"></div></td>' +
      '<td><div style="border: 1px solid #3b6798;border-radius: 0px 2px 2px 0px;-moz-border-radius: 0px 2px 2px 0px;-webkit-border-radius: 0px 2px 2px 0px;"><div style="border: 1px solid #5c82ab; border-top-color: #7e9cbc; background-color: #6D8DB1; color: #fff; text-shadow: 0px 1px #45688E; height: 15px; padding: 2px 6px 0px 4px;line-height: 13px;">&#1050;&#1086;&#1085;&#1090;&#1072;&#1082;&#1090;&#1077;</div></div></td>' +
      '</tr></table>'
    );
    el.innerHTML = html;
    el.style.width = el.childNodes[0].offsetWidth + 'px';
  },
  _change: function(state, index) {
    var row = document.getElementById('openapi_UI_' + index).rows[0];
    var elems = [row.cells[0].firstChild.firstChild, row.cells[2].firstChild.firstChild];
    for (var i = 0; i < 2; ++i) {
       var elem = elems[i];
      if (state === 0) {
        elem.style.backgroundColor = '#6D8DB1';
        elem.style.borderTopColor = '#7E9CBC';
        elem.style.borderLeftColor = elem.style.borderRightColor = elem.style.borderBottomColor = '#5C82AB';
      } else if (state == 1) {
        elem.style.backgroundColor = '#7693B6';
        elem.style.borderTopColor = '#88A4C4';
        elem.style.borderLeftColor = elem.style.borderRightColor = elem.style.borderBottomColor = '#6088B4';
      } else if (state == 2) {
        elem.style.backgroundColor = '#6688AD';
        elem.style.borderBottomColor = '#7495B8';
        elem.style.borderLeftColor = elem.style.borderRightColor = elem.style.borderTopColor = '#51779F';
      }
    }
    if (state === 0 || state == 2) {
      row.cells[2].firstChild.style.backgroundPosition = '0px -42px';
    } else if (state == 1) {
      row.cells[2].firstChild.style.backgroundPosition = '0px -63px';
    }
  }
};
}

if (!VK.XDM) {
VK.XDM = {
  remote: null,
  init: function() {
    if (this.remote) return false;
    var url = VK._domain.api + VK._path.proxy;
    this.remote = new fastXDM.Server({
      onInit: function() {
        VK.xdReady = true;
        VK.Observer.publish('xdm.init');
      }
    });

    this.remote.append(document.getElementById(VK._rootId), {
      src: url
    });
  },
  xdHandler: function(code) {
    try {
      eval('VK.' + code);
    } catch(e) {}
  }
};
}

if (!VK.Observer) {
VK.Observer = {
  _subscribers: function() {
    if (!this._subscribersMap) {
      this._subscribersMap = {};
    }
    return this._subscribersMap;
  },
  publish: function(eventName) {
    var
      args = Array.prototype.slice.call(arguments),
      eventName = args.shift(),
      subscribers = this._subscribers()[eventName],
      i, j;

    if (!subscribers) return;

    for (i = 0, j = subscribers.length; i < j; i++) {
      if (subscribers[i] != null) {
        subscribers[i].apply(this, args);
      }
    }
  },
  subscribe: function(eventName, handler) {
    var
      subscribers = this._subscribers();

    if (typeof handler != 'function') return false;

    if (!subscribers[eventName]) {
      subscribers[eventName] = [handler];
    } else {
      subscribers[eventName].push(handler);
    }
  },
  unsubscribe: function(eventName, handler) {
    var
      subscribers = this._subscribers()[eventName],
      i, j;

    if (!subscribers) return false;
    if (typeof handler == 'function') {
      for (i = 0, j = subscribers.length; i < j; i++) {
        if (subscribers[i] == handler) {
          subscribers[i] = null;
        }
      }
    } else {
      delete this._subscribers()[eventName];
    }
  }
};
}

if (!VK.Widgets) {
  VK.Widgets = {};

  VK.Widgets.count = 0;
  VK.Widgets.RPC = {};

  VK.Widgets.loading = function(obj, enabled) {
    obj.style.background = enabled ? 'url("' + VK._protocol + '//vk.com/images/upload.gif") center center no-repeat transparent' : 'none';
  };

  VK.Widgets.Comments = function(objId, options, page) {
    var pData = VK.Util.getPageData();
    if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    options = options || {};
    var params = {
      limit: options.limit || 10,
      height: options.height || 0,
      mini: options.mini === undefined ? 'auto' : options.mini,
      norealtime: options.norealtime ? 1 : 0
    }, mouseup = function() {
      rpc.callMethod('mouseUp');
      return false;
    }, move = function(event) {
      rpc.callMethod('mouseMove', {screenY: event.screenY});
    }, iframe, rpc;

    if (options.browse) { // browse all comments
      params.browse = 1;
      params.replies = options.replies || 0;
    } else { // page
      var url = options.pageUrl || pData.url;
      if (url.substr(0, 1) == '/') {
        url = (location.protocol + '//' + location.host) + url;
      }
      VK.extend(params, {
        page: page || 0,
        status_publish: options.autoPublish === undefined ? 1 : options.autoPublish,
        attach: options.attach === undefined ? '*' : (options.attach ? options.attach : ''),
        url: url,
        title: options.pageTitle || pData.title,
        description: options.pageDescription || pData.description,
        image: options.pageImage || pData.image
      });
    }
    if (options.onChange) { // DEPRECATED
      VK.Observer.subscribe('widgets.comments.new_comment', options.onChange);
      VK.Observer.subscribe('widgets.comments.delete_comment', options.onChange);
    }

    return VK.Widgets._constructor('widget_comments.php', objId, options, params, {
      showBox: function(url, props) {
        var box = VK.Util.Box((options.base_domain || VK._protocol + '//vk.com') + '/' + url, [], {
          proxy: function() {
            rpc.callMethod.apply(rpc, arguments);
          }
        });
        box.show();
      },
      startDrag: function() {
        cursorBack = window.document.body.style.cursor;
        window.document.body.style.cursor = 'pointer';
        VK.Util.addEvent('mousemove', move);
        VK.Util.addEvent('mouseup', mouseup);
      },
      stopDrag: function() {
        window.document.body.style.cursor = cursorBack;
        VK.Util.removeEvent('mousemove', move);
        VK.Util.removeEvent('mouseup', mouseup);
      }
    }, {
      startHeight: 133,
      minWidth: 300,
      width: '100%'
    }, function(o, i, r) {iframe = i; rpc = r;});
  };

  VK.Widgets.CommentsBrowse = function(objId, options) {
    options = options || {};
    options.browse = 1;
    return VK.Widgets.Comments(objId, options);
  };

  VK.Widgets.Recommended = function(objId, options) {
    var pData = VK.Util.getPageData();
    if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    options = options || {};
    var params = {
      limit: options.limit || 5,
      max: options.max || 0,
      sort: options.sort || 'friend_likes',
      verb: options.verb || 0,
      period: options.period || 'week',
      target: options.target || 'parent'
    };
    return VK.Widgets._constructor('widget_recommended.php', objId, options, params, {}, {
      startHeight: (90 + params.limit * 30),
      minWidth: 150,
      width: '100%'
    });
  };

  VK.Widgets.Like = function(objId, options, page) {
    var pData = VK.Util.getPageData();
    if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    options = VK.extend(options || {}, {allowTransparency: true});
    if (options.type == 'button' || options.type == 'vertical' || options.type == 'mini') delete options.width;
    var
      type = (options.type == 'full' || options.type == 'button' || options.type == 'vertical' || options.type == 'mini') ? options.type : 'full',
      width = type == 'full' ? Math.max(200, options.width || 350) : (type == 'button' ? 180 : (type == 'mini' ? 100 : 41)),
      btnHeight = parseInt(options.height, 10) || 22,
      height = type == 'vertical' ? (2 * btnHeight + 7) : (type == 'full' ? btnHeight + 1 : btnHeight),
      params = {
        page: page || 0,
        url: options.pageUrl || pData.url,
        type: type,
        verb: options.verb == 1 ? 1 : 0,
        title: options.pageTitle || pData.title,
        description: options.pageDescription || pData.description,
        image: options.pageImage || pData.image,
        text: (options.text || '').substr(0, 140),
        h: btnHeight
      },
      ttHere = options.ttHere || false,
      isOver = false,
      obj, buttonIfr, buttonRpc, tooltipIfr, tooltipRpc, checkTO, statsBox;

    function showTooltip(force) {
      if ((!isOver && !force) || !tooltipRpc) return;
      if (!tooltipIfr || !tooltipRpc || tooltipIfr.style.display != 'none' && tooltipIfr.getAttribute('vkhidden') != 'yes') return;
      var scrollTop = options.getScrollTop ? options.getScrollTop() : (document.body.scrollTop || document.documentElement.scrollTop || 0);
      var objPos = VK.Util.getXY(obj, options.fixed);
      var startY = ttHere ? 0 : objPos[1];
      if (scrollTop > objPos[1] - 120 && options.tooltipPos != 'top' || type == 'vertical' || options.tooltipPos == 'bottom') {
        tooltipIfr.style.top = (startY + height + 2) + 'px';
        tooltipRpc.callMethod('show', false);
      } else {
        tooltipIfr.style.top = (startY - 125) + 'px';
        tooltipRpc.callMethod('show', true);
      }
      VK.Util.ss(tooltipIfr, {left: ((ttHere ? 0 : objPos[0]) - (type == 'vertical' || type == 'mini' ? 36 : 2)) + 'px', display: 'block', opacity: 1, filter: 'none'});
      tooltipIfr.setAttribute('vkhidden', 'no');
      isOver = true;
    }

    function hideTooltip(force) {
      if ((isOver && !force) || !tooltipRpc) return;
      tooltipRpc.callMethod('hide');
      buttonRpc.callMethod('hide');
      setTimeout(function() {
        tooltipIfr.style.display = 'none'
      }, 400);
    }

    return VK.Widgets._constructor('widget_like.php', objId, options, params, {
      initTooltip: function(counter) {
        tooltipRpc = new fastXDM.Server({
          onInit: counter ? function() {showTooltip(true)} : function() {},
          proxy: function() {
             buttonRpc.callMethod.apply(buttonRpc, arguments);
          },
          showBox: function(url, props) {
            var box = VK.Util.Box((options.base_domain || VK._protocol + '//vk.com/') + url, [props.width, props.height], {
              proxy: function() {
                tooltipRpc.callMethod.apply(tooltipRpc, arguments);
              }
            });
            box.show();
          },
          statsBox: function(act) {
            hideTooltip(true);
            statsBox = VK.Util.Box(buttonIfr.src + '&act=a_stats_box&widget_width=620');
            statsBox.show();
          }
        }, false, {safe: true});
        tooltipIfr = tooltipRpc.append(ttHere ? obj : document.body, {
          src: buttonIfr.src + '&act=a_share_tooltip',
          scrolling: 'no',
          allowTransparency: true,
          id: buttonIfr.id + '_tt',
          style: {position: 'absolute', padding: 0, display: 'block', opacity: 0.01, filter: 'alpha(opacity=1)', border: '0', width: '206px', height: '127px', zIndex: 5000, overflow: 'hidden'}
        });
        tooltipIfr.setAttribute('vkhidden', 'yes');

        obj.onmouseover = tooltipIfr.onmouseover = function() {isOver = true;};
        obj.onmouseout = tooltipIfr.onmouseout = function() {
          clearTimeout(checkTO);
          isOver = false;
          checkTO = setTimeout(function() {hideTooltip(); }, 200);
        };
      },
      showTooltip: showTooltip,
      hideTooltip: hideTooltip,
      showBox: function(url, props) {
        var box = VK.Util.Box((options.base_domain || VK._protocol + '//vk.com/') + url, [], {
          proxy: function() {
            buttonRpc.callMethod.apply(buttonRpc, arguments);
          }
        });
        box.show();
      },
      proxy: function() {if (tooltipRpc) tooltipRpc.callMethod.apply(tooltipRpc, arguments);}
    }, {
      startHeight: height,
      minWidth: width
    }, function(o, i, r) {
      buttonRpc = r;
      VK.Util.ss(obj = o, {height: height + 'px', width: width + 'px', position: 'relative', clear: 'both'});
      VK.Util.ss(buttonIfr = i, {height: height + 'px', width: width + 'px', overflow: 'hidden', zIndex: 150});
    });
  };

  VK.Widgets.Poll = function(objId, options, pollId) {
    var pData = VK.Util.getPageData();
    // if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    if (!pollId) throw Error('No poll id passed');
    options = options || {};
    var params = {
      poll_id: pollId,
      url: options.pageUrl || pData.url || location.href,
      title: options.pageTitle || pData.title,
      description: options.pageDescription || pData.description
    };
    return VK.Widgets._constructor('widget_poll.php', objId, options, params, {}, {
      startHeight: 133,
      minWidth: 300,
      width: '100%'
    });
  };

  VK.Widgets.PagePoll = function(objId, options, page) {
    var pData = VK.Util.getPageData();
    // if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    options = options || {};
    var params = {
      page: page || 0,
      norealtime: options.norealtime ? 1 : 0,
      poll_id: options.pollId || '',
      url: options.pageUrl || pData.url || location.href,
      title: options.pageTitle || pData.title,
      description: options.pageDescription || pData.description
    };
    return VK.Widgets._constructor('al_widget_poll.php', objId, options, params, {}, {
      startHeight: 133,
      minWidth: 300,
      width: '100%'
    });
  };

  VK.Widgets.Community = VK.Widgets.Group = function(objId, options, gid) {
    gid = parseInt(gid, 10);
    var RPC;
    if (!gid) {
      throw Error('No group_id passed');
    }
    options.mode = parseInt(options.mode, 10).toString();
    var params = {
      gid: gid,
      mode: (options.mode) ? options.mode : '0'
    };
    if (!options.width) options.width = 200;
    if (options.wall) params.wall = options.wall;
    params.color1 = options.color1 || '';
    params.color2 = options.color2 || '';
    params.color3 = options.color3 || '';
    if (options.no_head) params.no_head = 1;
    if (!options.height) options.height = 290;
    if (options.wide) {
      params.wide = 1;
      if (options.width < 300) {
        options.width = 300;
      }
    }

    var cursorBack;

    function mouseup() {
      RPC.callMethod('mouseUp');
      return false;
    }

    function move(event) {
      RPC.callMethod('mouseMove', {screenY: event.screenY});
      return false;
    }

    return VK.Widgets._constructor('widget_community.php', objId, options, params, {
      showBox: function(url, props) {
        var box = VK.Util.Box((options.base_domain || VK._protocol + '//vk.com/') + url, [], {
          proxy: function() {
            rpc.callMethod.apply(rpc, arguments);
          }
        });
        box.show();
      },
      startDrag: function() {
        cursorBack = window.document.body.style.cursor;
        window.document.body.style.cursor = 'pointer';
        VK.Util.addEvent('mousemove', move);
        VK.Util.addEvent('mouseup', mouseup);
      },
      stopDrag: function() {
        window.document.body.style.cursor = cursorBack;
        VK.Util.removeEvent('mousemove', move);
        VK.Util.removeEvent('mouseup', mouseup);
      },
      auth: function() {
        VK.Auth.login(null, 1);
      }
    }, {
      minWidth: 120,
      width: '200',
      height: '290',
      startHeight: 200
    }, function(o, i, r) {
      RPC = r;
    });
  };

  VK.Widgets.Auth = function(objId, options) {
    var pData = VK.Util.getPageData();
    if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    if (!options.width) {
      options.width = 200;
    }
    if (options.type) {
      type = 1;
    } else {
      type = 0;
    }
    return VK.Widgets._constructor('widget_auth.php', objId, options, {}, {makeAuth: function(data) {
      if (data.session) {
        VK.Auth._loadState = 'loaded';
        VK.Auth.setSession(data.session, 'connected');
        VK.Observer.publish('auth.loginStatus', {session: data.session, status: 'connected'});
        VK.Observer.unsubscribe('auth.loginStatus');
      }
      if (options.onAuth) {
        options.onAuth(data);
      } else {
        if (options.authUrl) {
          var href = options.authUrl;
        } else {
          var href = window.location.href;
        }
        if (href.indexOf('?') == -1) {
          href+='?';
        } else {
          href+='&';
        }
        var vars = [];

        for (var i in data) {
          if (i != 'session') vars.push(i+'='+decodeURIComponent(data[i]).replace(/&/g, '%26').replace(/\?/, '%3F'));
        }
        window.location.href = href + vars.join('&');
      }
    }}, {startHeight: 80});
  };

  VK.Widgets.Subscribe = function(objId, options, oid) {
    oid = parseInt(oid, 10);
    var RPC;
    if (!oid) {
      throw Error('No owner_id passed');
    }
    var params = {
      oid: oid
    };
    if (options.mode) {
      params.mode = options.mode;
    }
    if (options.soft) {
      params.soft = options.soft;
    }

    return VK.Widgets._constructor('widget_subscribe.php', objId, options, params, {
      showBox: function(url, props) {
        var box = VK.Util.Box((options.base_domain || VK._protocol + '//vk.com/') + url, [], {
          proxy: function() {
            rpc.callMethod.apply(rpc, arguments);
          }
        });
        box.show();
      },
      auth: function() {
        VK.Auth.login(null, 1);
      }
    }, {
      minWidth: 220,
      startHeight: 22,
      height: options.height || 22
    }, function(o, i, r) {
      RPC = r;
    });
  };

  VK.Widgets.Ads = function(objId, options, paramsExtra) {
    options = options || {};
    paramsExtra = paramsExtra || {};
    var params = {};
    var defaults = {};
    var funcs = {};
    var obj = document.getElementById(objId);
    var iframe;
    var rpc;

    var adsParams = {};
    var adsParamsLocal = {};
    var adsParamsDefault = {};
    for (var key in paramsExtra) {
      var keyFix = (inArray(key, ['hash']) ? key : 'ads_' + key);
      adsParams[keyFix] = paramsExtra[key];
    }

    if (obj && obj.getBoundingClientRect) {
      obj.style.width  = '100%';
      obj.style.height = '100%';
      var rect = obj.getBoundingClientRect();
      obj.style.width  = '';
      obj.style.height = '';
      adsParams.ads_ad_unit_width_auto  = Math.floor(rect.right - rect.left);
      adsParams.ads_ad_unit_height_auto = Math.floor(rect.bottom - rect.top);
    }

    adsParamsDefault.ads_ad_unit_width  = 100;
    adsParamsDefault.ads_ad_unit_height = 100;

    adsParamsLocal.ads_ad_unit_width  = (parseInt(adsParams.ads_ad_unit_width)  || adsParams.ads_ad_unit_width === 'auto'  && adsParams.ads_ad_unit_width_auto  || adsParamsDefault.ads_ad_unit_width);
    adsParamsLocal.ads_ad_unit_height = (parseInt(adsParams.ads_ad_unit_height) || adsParams.ads_ad_unit_height === 'auto' && adsParams.ads_ad_unit_height_auto || adsParamsDefault.ads_ad_unit_height);
    if (adsParams.ads_handler) {
      adsParamsLocal.ads_handler = adsParams.ads_handler;
    }
    if (adsParams.ads_handler_empty_html) {
      adsParamsLocal.ads_handler_empty_html = adsParams.ads_handler_empty_html;
    }

    delete adsParams.ads_handler;
    delete adsParams.ads_handler_empty_html;

    params.act = 'ads_web';
    params.url = location.href;
    VK.extend(params, adsParams);

    options.noDefaultParams   = true;
    options.width             = adsParamsLocal.ads_ad_unit_width;
    options.allowTransparency = true;
    defaults.startHeight = adsParamsLocal.ads_ad_unit_height;
    defaults.minWidth    = adsParamsLocal.ads_ad_unit_width;
    funcs.adsOnInitLoader = adsOnInitLoader;
    funcs.adsOnInit       = adsOnInit;

    return VK.Widgets._constructor('ads_rotate.php', objId, options, params, funcs, defaults, onDone);

    function adsOnInitLoader(adsScriptVersion) {
      VK.Widgets.loading(obj, true);
      adsAttachScript(adsScriptVersion);
    }
    function adsOnInit(errorCode, adsParamsExport) {
      VK.Widgets.loading(obj, false);
      adsProcessParams(adsParamsExport);
      if (options.onAdsReady) options.onAdsReady.apply(options.onAdsReady, Array.prototype.slice.call(arguments));
      adsProcessHandler(errorCode);
    }
    function adsAttachScript(adsScriptVersion) {
      if (!('vk__adsLight' in window)) {
        window.vk__adsLight = false;
        adsScriptVersion = parseInt(adsScriptVersion);
        var attachScriptFunc = (VK.Api && VK.Api.attachScript || VK.addScript);
        var base_domain = (options.base_domain || VK._protocol + '//vk.com');
        attachScriptFunc(base_domain + '/js/al/aes_light.js?' + adsScriptVersion);
      } else if (window.vk__adsLight && vk__adsLight.userHandlers && vk__adsLight.userHandlers.onInit) {
        vk__adsLight.userHandlers.onInit(false); // false - do not publish initial onInit
      }
    }
    function adsProcessParams(adsParamsExport) {
      if (!adsParamsExport) {
        return;
      }
      for (var paramName in adsParamsExport) {
        var paramValue = adsParamsExport[paramName];
        if (paramName === 'ads_ad_unit_width' || paramName === 'ads_ad_unit_height') {
          if (!(paramName in adsParams)) {
            adsParamsLocal[paramName] = (parseInt(paramValue) || paramValue === 'auto' && adsParams[paramName + '_auto'] || adsParamsDefault[paramName]);
          }
        } else {
          if (!(paramName in adsParamsLocal)) {
            adsParamsLocal[paramName] = paramValue;
          }
        }
      }
    }
    function adsProcessHandler(errorCode) {
      var handlerResult = adsEvalHandler(adsParamsLocal.ads_handler, errorCode);
      if (errorCode <= 0 && handlerResult !== true) {
        try { console.log('VK: ad_unit_id = ' + adsParams.ads_ad_unit_id, ', errorCode = ', errorCode); } catch (e) {}
        adsInsertHtmlHandler(adsParamsLocal.ads_handler_empty_html, adsParamsLocal.ads_ad_unit_width, adsParamsLocal.ads_ad_unit_height);
      }
    }
    function adsEvalHandler(handler) {
      var result = false;
      try {
        if (!handler) {
          return false;
        }
        var func = false;
        if (isFunction(handler)) {
          func = handler;
        } else if (isString(handler)) {
          var handlerFuncs = handler.split('.');
          func = window;
          for (var i = 0, len = handlerFuncs.length; i < len; i++) {
            func = func[handlerFuncs[i]];
            if (!func) {
              break;
            }
          }
          if (!func) {
            if (handler.substr(0, 8) === 'function') {
              handler = 'return ' + handler + ';';
            }
            var handlerResult = (new Function(handler))();
            if (isFunction(handlerResult)) {
              func = handlerResult;
            } else {
              result = handlerResult;
            }
          }
        }
        if (func) {
          var args = Array.prototype.slice.call(arguments, 1);
          result = func.apply(func, args);
        }
      } catch (e) {
        try {
          console.error(e);
        } catch (e2) {}
      }

      return result;

      function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
      }
      function isString(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
      }
    }
    function adsInsertHtmlHandler(handlerHtml, width, height) {
      if (!handlerHtml) {
        return;
      }
      if (!obj) {
        return;
      }

      width  = (width  ? width  + 'px' : '');
      height = (height ? height + 'px' : '');

      var iframeHandlerHtml = '<html><head></head><body style="padding: 0; margin: 0;"><div>' + handlerHtml + '</div></body></html>';

      var iframeHandler = document.createElement('iframe');
      iframeHandler.onload            = fixIframeHeight;
      iframeHandler.id                = (iframe ? iframe.id : ('vkwidget-' + Math.round(Math.random() * 1000000))) + '_ads_html_handler';
      iframeHandler.src               = 'about:blank';
      iframeHandler.width             = '100%';
      iframeHandler.height            = '100%';
      iframeHandler.scrolling         = 'no';
      iframeHandler.frameBorder       = '0';
      iframeHandler.allowTransparency = true;
      iframeHandler.style.overflow    = 'hidden';
      iframeHandler.style.width       = width;
      iframeHandler.style.height      = height;

      obj.style.width                 = width;
      obj.style.height                = height;

      obj.appendChild(iframeHandler);

      iframeHandler.contentWindow.vk_ads_html_handler = iframeHandlerHtml;
      iframeHandler.src = 'javascript:window["vk_ads_html_handler"]';

      function fixIframeHeight() {
        if (height) {
          return;
        }
        try {
          var rect = iframeHandler.contentWindow.document.body.firstChild.getBoundingClientRect();
          var heightFix = Math.ceil(rect.bottom - rect.top);
          if (heightFix) {
            iframeHandler.style.height = heightFix;
            obj.style.height           = heightFix;
          }
        } catch (e) {}
      }
    }
    function indexOf(arr, value, from) {
      for (var i = from || 0, l = (arr || []).length; i < l; i++) {
        if (arr[i] == value) return i;
      }
      return -1;
    }
    function inArray(value, arr) {
      return indexOf(arr, value) != -1;
    }
    function onDone(o, i, r) {
      obj = o;
      iframe = i;
      rpc = r;
    }
  };

  VK.Widgets._constructor = function(widgetUrl, objId, options, params, funcs, defaults, onDone, widgetId, iter) {
    var obj = document.getElementById(objId);
    widgetId = widgetId || (++VK.Widgets.count);

    if (!obj) {
      iter = iter || 0;
      if (iter > 10) {
        throw Error('VK.Widgets: object #' + objId + ' not found.');
      }
      setTimeout(function() {
        VK.Widgets._constructor(widgetUrl, objId, options, params, funcs, defaults, onDone, widgetId, iter + 1);
      }, 500);
      return widgetId;
    }

    var ifr, base_domain, width, url, urlQueryString, encodedParam, rpc, iframe, i;
    options = options || {};
    defaults = defaults || {};
    funcs = funcs || {};

    base_domain = options.base_domain || VK._protocol + '//vk.com';
    width = (options.width == 'auto') ? obj.clientWidth || '100%' : parseInt(options.width, 10);

    if (options.height) {
      params.height = options.height;
      obj.style.height = options.height + 'px';
    } else {
      obj.style.height = (defaults.startHeight || 200) + 'px';
    }

    width = width ? (Math.max(defaults.minWidth || 200, Math.min(10000, width)) + 'px') : '100%';

    if (!params.url) {
      params.url = options.pageUrl || location.href.replace(/#.*$/, '');
    }
    url = base_domain + '/' + widgetUrl;
    urlQueryString = '';
    if (!options.noDefaultParams) {
      urlQueryString += '&app=' + (VK._apiId || '0') + '&width=' + width
    }
    urlQueryString += '&_ver=' + VK.version
    if (VK._iframeAppWidget) {
      params.iframe_app = 1;
    }
    for (i in params) {
      if (i == 'title' && params[i].length > 80) params[i] = params[i].substr(0, 80)+'...';
      if (i == 'description' && params[i].length > 160) params[i] = params[i].substr(0, 160)+'...';
      if (typeof(params[i]) == 'number') {
        encodedParam = params[i];
      } else {
        try {
          encodedParam = encodeURIComponent(params[i]);
        } catch (e) {
          encodedParam = '';
        }
      }
      urlQueryString += '&' + i + '=' + encodedParam;
    }
    urlQueryString += '&' + (+new Date()).toString(16);
    url += '?' + urlQueryString.substr(1);

    obj.style.width = width;
    VK.Widgets.loading(obj, true);

    funcs.publish = function() {
      var args = Array.prototype.slice.call(arguments);
      args.push(widgetId);
      VK.Observer.publish.apply(VK.Observer, args);
    };
    funcs.onInit = function() {
      VK.Widgets.loading(obj, false);
      if (funcs.onReady) funcs.onReady();
      if (options.onReady) options.onReady();
    }
    funcs.resize = function(e, cb) {
      obj.style.height = e + 'px';
      var el = document.getElementById('vkwidget' + widgetId);
      if (el) {
        el.style.height = e + 'px';
      }
    }
    funcs.resizeWidget = function(newWidth, newHeight) {
      newWidth  = parseInt(newWidth);
      newHeight = parseInt(newHeight);
      var widgetElem = document.getElementById('vkwidget' + widgetId);
      if (isFinite(newWidth)) {
        obj.style.width = newWidth + 'px';
        if (widgetElem) {
          widgetElem.style.width = newWidth + 'px';
        }
      }
      if (isFinite(newHeight)) {
        obj.style.height = newHeight + 'px';
        if (widgetElem) {
          widgetElem.style.height = newHeight + 'px';
        }
      }
      if (options.onResizeWidget) options.onResizeWidget();
    }
    funcs.updateVersion = function(ver) {
      if (ver > 1) {
        VK.Api.attachScript('//vk.com/js/api/openapi_update.js?'+parseInt(ver));
      }
    }
    rpc = VK.Widgets.RPC[widgetId] = new fastXDM.Server(funcs, function(origin) {
      if (!origin) return true;
      origin = origin.toLowerCase();
      return (origin.indexOf('.vk.com') != -1 || origin.indexOf('/vk.com') != -1);
    }, {safe: true});
    iframe = VK.Widgets.RPC[widgetId].append(obj, {
      src: url,
      width: (width.indexOf('%') != -1) ? width : (parseInt(width) || width),
      height: defaults.startHeight || '100%',
      scrolling: 'no',
      id: 'vkwidget' + widgetId,
      allowTransparency: options.allowTransparency || false,
      style: {
        overflow: 'hidden'
      }
    });
    onDone && setTimeout(function() {onDone(obj, iframe || obj.firstChild, rpc);}, 10);
    return widgetId;
  };
}

if (!VK.Util) {
VK.Util = {
  getPageData: function() {
    if (!VK._pData) {
      var metas = document.getElementsByTagName('meta'), pData = {}, keys = ['description', 'title', 'url', 'image', 'app_id'], metaName;
      for (var i in metas) {
        if (!metas[i].getAttribute) continue;
        if (metas[i].getAttribute && ((metaName = metas[i].getAttribute('name')) || (metaName = metas[i].getAttribute('property')))) {
          for (var j in keys) {
            if (metaName == keys[j] || metaName == 'og:'+keys[j] || metaName == 'vk:'+keys[j]) {
              pData[keys[j]] = metas[i].content;
            }
          }
        }
      }
      if (pData.app_id && !VK._apiId) {
        VK._apiId = pData.app_id;
      }
      pData.title = pData.title || document.title || '';
      pData.description = pData.description || '';
      pData.image = pData.image || '';
      if (!pData.url && VK._iframeAppWidget && VK._apiId) {
        pData.url = '/app' + VK._apiId;
        if (VK._browserHash) {
          pData.url += VK._browserHash
        }
      }
      var loc = location.href.replace(/#.*$/, '');
      if (!pData.url || !pData.url.indexOf(loc)) {
        pData.url = loc;
      }
      VK._pData = pData;
    }
    return VK._pData;
  },
  getStyle: function(elem, name) {
    var ret, defaultView = document.defaultView || window;
    if (defaultView.getComputedStyle) {
      name = name.replace(/([A-Z])/g, '-$1').toLowerCase();
      var computedStyle = defaultView.getComputedStyle(elem, null);
      if (computedStyle) {
        ret = computedStyle.getPropertyValue(name);
      }
    } else if (elem.currentStyle) {
      var camelCase = name.replace(/\-(\w)/g, function(all, letter){
        return letter.toUpperCase();
      });
      ret = elem.currentStyle[name] || elem.currentStyle[camelCase];
    }

    return ret;
  },
  getXY: function(obj, fixed) {
    if (!obj || obj === undefined) return;

    var left = 0, top = 0;
    if (obj.getBoundingClientRect !== undefined) {
      var rect = obj.getBoundingClientRect();
      left = rect.left;
      top = rect.top;
      fixed = true;
    } else if (obj.offsetParent) {
      do {
        left += obj.offsetLeft;
        top += obj.offsetTop;
        if (fixed) {
          left -= obj.scrollLeft;
          top -= obj.scrollTop;
        }
      } while (obj = obj.offsetParent);
    }
    if (fixed) {
      top += window.pageYOffset || window.scrollNode && scrollNode.scrollTop || document.documentElement.scrollTop;
      left += window.pageXOffset || window.scrollNode && scrollNode.scrollLeft || document.documentElement.scrollLeft;
    }

    return [left, top];
  },
  Box: function(src, sizes, fnc, options) {
    fnc = fnc || {};
    var overflowB = document.body.style.overflow;
    var loader = document.createElement('DIV');
    var rpc = new fastXDM.Server(VK.extend(fnc, {
      onInit: function() {
        iframe.style.background = 'transparent';
        iframe.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        document.body.removeChild(loader);
      },
      hide: function() {
        iframe.style.display = 'none';
      },
      tempHide: function() {
        iframe.style.left = '-10000px';
        iframe.style.top = '-10000px';
        iframe.style.width = '10px';
        iframe.style.height = '10px';
        document.body.style.overflow = overflowB;
      },
      destroy: function() {
        try {
          iframe.src = 'about: blank;';
        } catch (e) {}
        iframe.parentNode.removeChild(iframe);
        document.body.style.overflow = overflowB;
      },
      resize: function(w, h) {
      }
    }, true), false, {safe: true}),
    iframe = rpc.append(document.body, {
      src: src.replace(/&amp;/g, '&'),
      scrolling: 'no',
      allowTransparency: true,
      style: {position: 'fixed', left: 0, top: 0, zIndex: 1002, background: VK._protocol + '//vk.com/images/upload.gif center center no-repeat transparent', padding: '0', border: '0', width: '100%', height: '100%', overflow: 'hidden', visibility: 'hidden'}
    });
    loader.innerHTML = '<div style="position: fixed;left: 50%;top: 50%;margin: 0px auto 0px -60px;z-index: 1002;width: 100px;"><div style="background: url(//vk.com/images/upload_inv_mono'+(window.devicePixelRatio >= 2 ? '_2x' : '')+'.gif) no-repeat 50% 50%;background-size: 64px 16px;height: 50px;position: absolute;width: 100%;z-index: 100;"></div><div style="background-color: #000;opacity: 0.7;filter: alpha(opacity=70);height: 50px;-webkit-border-radius: 5px;-khtml-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;-webkit-box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.35);-moz-box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.35);box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.35);"></div></div>';
    document.body.insertBefore(loader, document.body.firstChild);
    return {
      show: function(scrollTop, height) {
        iframe.style.display = 'block';
        document.body.style.overflow = 'hidden';
      },
      hide: function() {
        iframe.style.display = 'none';
        document.body.style.overflow = overflowB;
      },
      iframe: iframe,
      rpc: rpc
    }
  },
  addEvent: function(type, func) {
    if (window.document.addEventListener) {
      window.document.addEventListener(type, func, false);
    } else if (window.document.attachEvent) {
      window.document.attachEvent('on'+type, func);
    }
  },
  removeEvent: function(type, func) {
    if (window.document.removeEventListener) {
      window.document.removeEventListener(type, func, false);
    } else if (window.document.detachEvent) {
      window.document.detachEvent('on'+type, func);
    }
  },
  ss: function(el, styles) {VK.extend(el.style, styles, true);}
};
}

// Init asynchronous library loading
window.vkAsyncInit && setTimeout(vkAsyncInit, 0);

if (window.vkAsyncInitCallbacks && vkAsyncInitCallbacks.length) {
  setTimeout(function() {
    var callback;
    while (callback = vkAsyncInitCallbacks.pop()) {
      try {
        callback();
      } catch(e) {
        try {
          console.error(e);
        } catch (e2) {}
      }
    }
  }, 0);
}
try{if (window.stManager) stManager.done('api/openapi.js');}catch(e){}
angular.module('App').controller('Cm_vkCaptcha', ['$scope', 'imageUrl', function($scope, imageUrl) {
  $scope.imageUrl = imageUrl;
}])
 
angular.module('App')
  .service('PS_echonest', ['$http', '__echonest', function($http, __echonest) {

    var service = {};

    service.getStaticPlaylist = function(options) {
      return call('playlist/static', angular.extend({
        type: 'artist-radio',
        bucket: 'id:musicbrainz',
        results: 50
      }, options));
    }

    service.getGenresList = function(options) {
      return call('genre/list', angular.extend({
        results: 50
      }, options));
    }


    function call(method, options) {
      return $http({
        url: __echonest.url + method,
        method: 'GET',
        params: angular.extend({api_key: __echonest.key},options)
      });
    }


    return service;
  }]);

angular.module('App')
  .service('PS_lastfm', ['$q', '$http', '__lastfm', function($q, $http, __lastfm) {
    var service = {};
    var lastfm;
    service.init = function() {

    }

    service.artist = {
      getInfo: function(artist) {
        return call('artist.getInfo', {
          artist: artist,
          autocorrect: true
        });
      },
      getTopTags: function(artist) {
        return call('artist.getTopTags', {
          artist: artist,
          autocorrect: true
        });
      },
      getTopAlbums: function(options, callback) {
        var deferred = $q.defer();
      
        call('artist.getTopAlbums', angular.extend(options, {
          limit: 16,
          page: 0
        })).then(function(resp) {
          var albums = [];
          var data = resp.data;
          if (data.topalbums["@attr"]) {

            var pages = data.topalbums["@attr"].totalPages;
            var len = data.topalbums["@attr"].total;


            if (len == 1) {
              albums.push(data.topalbums.album);
            }
            if (len > 1) {
              var a = data.topalbums.album;
              for (i = 0; i < a.length; i++) {
                albums.push(a[i]);
              }
            }
          }

          for (var i = 0, l = albums.length; i < l; i++) {
            var a = albums[i];

            var il = a.image.length;
            a.albumImage = a.image[il - 1]['#text'];
          }

          deferred.resolve(albums);
        });

        return deferred.promise;
      }
    }

    service.album = {
      getInfo: function(options){
        return $q.when(call('album.getInfo', angular.extend({}, options)).then(function(resp){
          var imageSrc = resp.data.album.image[3]['#text'];
          resp.data.album.albumImage = imageSrc;
          
          return resp.data.album;
        }));
      }
    }

    service.tag = {
      getTopTracks: function(tag) {
        return call('tag.getTopTracks', {
          tag: tag,
          limit: 12
        });
      }
    }

    function call(method, options) {
      return $http.jsonp(__lastfm.url, {
        params: angular.extend(options, {
          format: 'json',
          callback: 'JSON_CALLBACK',
          method: method,
          api_key: __lastfm.keys.api
        })
      });
    }


    return service;
  }]);

angular.module('App')
  .service('PS_self', ['$http', '__api', function($http, __api) {

    var service = {};

    var base = __api.url;

    service.getHotArtists = function(options) {
      return $http({
        url: base + __api.paths.getTopArtists,
        method: 'GET'
      });
    }

    service.getTrackTranslationData = function(id) {
      return $http({
        url: base + __api.paths.getTrackTranslationData + id,
        method: 'GET'
      });
    }

    service.getTranslationUrl = function(hash) {
      return __api.url + __api.paths.translationTrackMp3 + hash;
    }

    return service;
  }]);

angular.module('App')
  .service('PS_vk', ['$q', '$modal', '$rootScope', '__vkAppId', function($q, $modal, $rootScope, __vkAppId) {

    var service = {};

    var userInfo = {};

    function call(method, options, defer) {
      defer = defer || $q.defer();
      options = $.extend({
        v: 5.23
      }, options);
      VK.Api.call(method, options, function(resp) {
        if (resp.response) {
          defer.resolve(resp);
        }

        if (resp.error && resp.error.error_code === 14) {
          var sid = resp.error.captcha_sid;
          $modal.open({
            templateUrl: 'templates/modals/vkCaptcha.html',
            controller: 'Cm_vkCaptcha as ctr',
            size: 'sm',
            resolve: {
              imageUrl: function() {
                return resp.error.captcha_img;
              }
            }
          }).result.then(function(code) {
            call(method, angular.extend(options, {
              captcha_key: code,
              captcha_sid: sid
            }), defer);
          });
        }

      });
      return defer.promise;
    }



    service.call = function(method, options) {
      return call(method, options);
    }

    function afterAuth(resp) {
      if (resp.session) {
        VK.Api.call('users.get', {
          fields: 'photo_50'
        }, function(r) {
          var id = r.response[0].uid;
          var name = r.response[0].first_name + ' ' + r.response[0].last_name;
          var photo = r.response[0].photo_50;


          userInfo = {
            id: id,
            name: name,
            photo: photo
          }

          $rootScope.$broadcast('userLogin', userInfo);
        });
      } else {
        $rootScope.$broadcast('badAuthorization');
      }
    }

    service.getUserInfo = function() {

    }

    service.init = function() {
      VK.init({
        apiId: __vkAppId
      });
    }

    service.authorize = function() {
      VK.Auth.login(function() {
        VK.Auth.getLoginStatus(afterAuth);
      }, VK.access.AUDIO + 262144);
    }


    service.intro = function() {
      VK.Auth.getLoginStatus(function(resp) {
        afterAuth(resp);
      });
    }

    service.get = function(options) {
      options = $.extend({
        count: 10,

      }, options);
      VK.Api.call('audio.get', {
        count: 50,
        offset: that.offset,
        v: 5
      }, function(f) {
        if (f.response) {
          var q = f.response;
          if (q.items.length > 0) {
            console.log(q.items);
          }

        }

      });
    }

    service.findTrackArray = function(array, callback, lastCallback) {

      var parallelSearch = 5;


      var l = array.length;

      var executeCount = Math.ceil(l / parallelSearch);
      var executeIndex = 0;


      function execute() {
        var code = '';
        var start = executeIndex * parallelSearch;
        for (var i = start; i < (start + parallelSearch); i++) {
          var el = array[i];
          if (!el) {
            break;
          }
          if (code != '')
            code += ',';
          code += parserVkSearchRequest(el.artist, el.title);
        }

        code = 'return [' + code + '];';


        service.call('execute', {
          code: code
        }).then(function(resp) {
          executeIndex++;
          callback(resp, start);
          console.log(resp);
          if (executeIndex < executeCount) {
            setTimeout(execute, 1000);
          } else {
            lastCallback();
          }
        });
      }
      execute();

    }

    service.search = function(options) {
      return call('audio.search', angular.extend({
        auto_complete: 1,
        lyrics: 0,
        performer_only: 0,
        sort: 2,
        search_own: 1,
        offset: 0,
        count: 50,
        v: 5.23
      }, options));
    }

    function parserVkSearchRequest(artist, title) {
      return 'API.audio.search({"q":"' + artist + ' ' + title + '","count": 10})';
    }


    return service;
  }]);

angular.module('App').controller('C_album', ['$stateParams', 'PS_lastfm', 'PS_vk','S_reduce',function($stateParams, PS_lastfm, PS_vk, S_reduce) {

  var ctr = this;

  var artist = $stateParams.artist;
  var albumName = $stateParams.albumName;



  ctr.audios = [];

  ctr.tracksPlurals = {
    0: 'нет треков',
    one: '{} трек',
    few: '{} трека',
    many: '{} треков',
    other: '{} треков'
  };


  PS_lastfm.album.getInfo({
    artist: artist,
    album: albumName
  }).then(function(data) {
    ctr.info = data;

    var filtTracks = getTracks(data);
    
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
      tracks = S_reduce.filterTracks(tracks);
      ctr.audios = ctr.audios.concat(tracks);


    }, function() {
      console.log('all!');
    });
  });


  function getTracks(data) {
    var filteredTracks = [];
    for (var i = 0, l = data.tracks.track.length; i < l; i++) {
      var track = data.tracks.track[i];
      filteredTracks.push({
        artist: track.artist.name,
        title: track.name,
        duration: track.duration
      });
    }

    if (typeof data.tracks.track.length === 'undefined'){
      filteredTracks.push(data.tracks.track); 
    }

    return filteredTracks;
  }

}]);

angular.module('App')
  .controller('C_artists',['PS_echonest', 'PS_self', function(PS_echonest, PS_self){
    var ctr = {};
/*
    PS_echonest.getArtistRadio({artist: 'Каста'}).then(function(data){
      console.log(data);
    })
*/
    PS_self.getHotArtists().then(function(data){
      ctr.artists = data.data.artists;
    })

    return ctr;
  }])
angular.module('App')
  .controller('C_artists.page', [
    '$q',
    '$stateParams',
    'PS_lastfm',
    'PS_self',
    'PS_vk',
    'S_reduce',
    function($q, $stateParams, PS_lastfm, PS_self, PS_vk, S_reduce) {
      var ctr = {};

      var artist = $stateParams.artist;

      $q.all({
        info: PS_lastfm.artist.getInfo(artist),
        albums: PS_lastfm.artist.getTopAlbums({
          artist: artist
        }),
        tags: PS_lastfm.artist.getTopTags(artist),
        tracks: PS_vk.search({
          q: artist
        })
      }).then(function(resp) {
        console.log(resp);




        var src = resp.info.data.artist;
        ctr.artistInfo = {
          name: src.name,
          image: src.image[src.image.length - 1]['#text'],
          tags: resp.tags.data.toptags.tag.splice(0, 7)
        }

        ctr.searchTracks = S_reduce.filterTracks(resp.tracks.response.items).splice(0,10);

        ctr.albums = resp.albums;
      });

      return ctr;
    }
  ])

angular.module('App')
  .controller('C_discover',['$stateParams','PS_echonest', 'PS_self', function($stateParams, PS_echonest, PS_self){
    var ctr = {};

    ctr.searchMode = ($stateParams.q)?true:false;

    ctr.query = $stateParams.q;

    PS_self.getHotArtists().then(function(data){
      ctr.artists = data.data.artists;
    })

    return ctr;
  }])
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
          tracks = S_reduce.filterTracks(tracks,{withDurations: true});

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

angular.module('App')
  .controller('C_share', [
    '$stateParams',
    '$scope',
    'PS_self',
    'PS_vk',
    'S_sound',
    '__api',
    function($stateParams, $scope, PS_self, PS_vk, S_sound, __api) {
      var ctr = {};

      var type = $stateParams.type;
      var id = $stateParams.id;

      if (type === 'track') {
        PS_self.getTrackTranslationData(id).then(function(resp) {
          console.log(resp);
          if (!resp.data.error) {
            var obj = angular.extend(resp.data, {
              url: PS_self.getTranslationUrl(resp.data.url)
            });
            if (soundManager.ok()) {
              S_sound.createAndPlay(obj);
            } else {
              S_sound.onload = function() {
                S_sound.createAndPlay(obj);
              }
            }

          }
        });
      }
      console.log();

      return ctr;
    }
  ])
