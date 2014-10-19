angular.module('App')
  .service('PS_lastfm', ['$q','__lastfmKeys', function($q,__lastfmKeys) {
    var service = {};
    var lastfm;
    service.init = function() {
      lastfm = new LastFM({
        apiKey: __lastfmKeys.api, 
        apiSecret: __lastfmKeys.secret
      });
    }

    service.artist = {
      getInfo: function(artist) {
        var deferred = $q.defer();
        var autocorrect = true;
        lastfm.artist.getInfo({
          artist: artist,
          autocorrect: autocorrect
        }, {
          success: function(data) {
            deferred.resolve(data);
          },
          error: function(code, message) {

          }
        });
        return deferred.promise;
      },
      getTopAlbums: function(options, callback) {
        var deferred = $q.defer();
        options = $.extend(options, {
          limit: 16,
          page: 0
        });
        lastfm.artist.getTopAlbums(options, {
          success: function(data) {
            var albums = [];
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
          }
        }, {
          error: function() {}
        });
        return deferred.promise;
      }
    }

    function call() {
      var deferred = $q.defer();

      return deferred.promise;
    }


    return service;
  }]);
