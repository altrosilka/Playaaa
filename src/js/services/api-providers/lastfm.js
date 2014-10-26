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
      getSimilar: function(artist) {

        var deferred = $q.defer();

        call('artist.getSimilar', {
          artist: artist,
          autocorrect: false,
          limit: 9
        }).then(function(resp) {

          var artists = resp.data.similarartists.artist, il;
          
          angular.forEach(artists, function(artist){
            il = artist.image.length;
            artist.imageSrc = artist.image[4]['#text'];
          });

          deferred.resolve(artists);
        });

        return deferred.promise;
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
      getInfo: function(options) {
        return $q.when(call('album.getInfo', angular.extend({}, options)).then(function(resp) {
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
