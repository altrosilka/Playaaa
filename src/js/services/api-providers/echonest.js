angular.module('App')
  .service('PS_echonest', ['$http', '__echonest', function($http, __echonest) {

    var service = {};

    service.getArtistRadio = function(options) {
      return call('playlist/static', angular.extend({
        type: 'artist-radio',
        bucket: 'id:musicbrainz',
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
