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

    service.extractArtists = function(text) {
      return call('artist/extract', {
        text: text,
        results: 3
      });
    }

    function call(method, options) {
      return $http({
        url: __echonest.url + method,
        method: 'GET',
        params: angular.extend({
          api_key: __echonest.key
        }, options)
      });
    }


    return service;
  }]);
