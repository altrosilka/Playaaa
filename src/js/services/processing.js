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