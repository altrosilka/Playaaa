angular.module('App')
  .directive('setBgOnLoad', ['$timeout', function($timeout) {
    return {
      scope: {
        src: '=setBgOnLoad'
      },
      link: function($scope, $element) {

        $scope.$watch('src', function(newSrc) {
          if (!newSrc) {
            return;
          }
          $element.removeClass('active');

          var animationTime = 500;

          var image = new Image();
          image.src = $scope.src;

          var time1 = new Date().getTime();

          image.onload = function() {
            var time2 = new Date().getTime();

            if (time2 - time1 < animationTime) {
              $timeout(function() {
                $element.css({
                  'background-image': 'url(' + $scope.src + ')'
                }).addClass('active');
              }, (animationTime - (time2 - time1)));
            } else {
              $element.css({
                'background-image': 'url(' + $scope.src + ')'
              }).addClass('active');
            }
          }
        });
      }
    }
  }]);
