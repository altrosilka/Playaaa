angular.module('App')
  .directive('albumImage', [function() {
    return {
      scope:{
        info: '='
      },
      templateUrl: 'templates/directives/albumImage.html'
    }
  }]);
