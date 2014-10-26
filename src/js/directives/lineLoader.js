angular.module('App')
  .directive('lineLoader', [function() {
    return {
      scope: {
        color: '=lineLoader'
      },
      templateUrl: 'templates/directives/lineLoader.html',
      link: function($scope, $element){
        if ($scope.color){
          $element.addClass($scope.color);
        }
      }
    }
  }]);
