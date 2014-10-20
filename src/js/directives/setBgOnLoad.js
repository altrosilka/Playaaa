angular.module('App')
  .directive('setBgOnLoad', [function() {
    return {
      scope:{ 
        src: '@setBgOnLoad'
      },
      link: function($scope, $element){ 
        var image = new Image();
        image.src = $scope.src; 

        image.onload = function(){

          $element.css({'background-image':'url('+$scope.src+')'}).addClass('active');
        }
      }
    }
  }]);
