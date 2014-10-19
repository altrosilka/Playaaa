angular.module('App')
  .service('S_enviroment', [function() {
    var service = {};

    service.setTitle = function(title) {
      document.title = title;
    }

    return service;
  }]);
