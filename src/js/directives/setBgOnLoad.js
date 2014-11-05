angular.module('App')
  .directive('setBgOnLoad', ['$timeout', function($timeout) {
    return {
      scope: {
        src: '=setBgOnLoad',
        newLayer: '='
      },
      link: function($scope, $element) {
        var layer;

        if (!$scope.newLayer) {
          layer = $(document.createElement('div')).addClass('layer').appendTo($element);
        }

        $scope.$watch('src', function(newSrc) {
          if (!newSrc) {
            return;
          }
          $element.removeClass('active');

          var animationTime = 600;

          var image = new Image();
          image.src = $scope.src;

          var time1 = new Date().getTime();

          if ($scope.newLayer) {
            image.onload = function() {
              var oldLayers = $element.find('.layer');
              var layer = $(document.createElement('div')).addClass('layer').css({
                "background-image": "url(" + $scope.src + ")"
              }).appendTo($element);
              $timeout(function() {
                layer.addClass('active');
              },100);
              $timeout(function() {
                oldLayers.remove();
              }, animationTime);
            };
          } else {
            image.onload = function() {
              var time2 = new Date().getTime();

              if (time2 - time1 < animationTime) {
                $timeout(function() {
                  layer.css({
                    'background-image': 'url(' + $scope.src + ')'
                  }).addClass('active');
                }, (animationTime - (time2 - time1)));
              } else {
                layer.css({
                  'background-image': 'url(' + $scope.src + ')'
                }).addClass('active');
              }
            }
          }
        });
      }
    }
  }]);
