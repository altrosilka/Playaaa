angular.module('App')
  .service('PS_self', ['$http', function($http) {

    var service = {};

    service.getHotArtists = function(options) {
      return $http({
        url: '/tmp/hotArtists.json',
        method: 'GET'
      });
    }

    return service;
  }]);
