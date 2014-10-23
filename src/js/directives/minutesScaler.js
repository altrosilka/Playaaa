angular.module('App')
  .directive('minutesScaler', [function() {
    return {
      scope: {
        duration: '='
      },
      templateUrl: 'templates/directives/minutesScaler.html',
      link: function($scope, $element) {

        $scope.$watch('duration', function(duration) {
          if (!duration) {
            return;
          }
          $element.html('');
          var w = $element[0].offsetWidth;

          var minutes = duration / 60;
          var pixelsOnMinute = w / minutes;
          var iterations = Math.ceil(minutes);

          for (var i = 1; i < iterations; i++) {
            $element.append('<div class="scale" style="left:' + (i * pixelsOnMinute) + 'px"></div>');
          }
        });
      }
    }
  }]);
