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
