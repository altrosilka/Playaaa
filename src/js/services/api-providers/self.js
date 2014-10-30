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

    service.addTrackToHistory = function(track) {
      console.log(123);
      return $http({
        url: base + __api.paths.history,
        method: 'POST',
        params: {
          track: track
        }
      });
    }
    return service;
  }]);
