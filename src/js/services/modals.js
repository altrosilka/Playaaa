angular.module('App')
  .service('S_modals', ['$modal',function($modal) {
    var service = {};

    service.openShareModal = function(trackInfo) { 
      $modal.open({
        templateUrl: 'templates/modals/shareTrack.html',
        controller: 'Cm_shareTrack as ctr',
        resolve: {
          trackInfo: function() {
            return trackInfo;
          }
        }
      }) 
    }

    return service;
  }]);
