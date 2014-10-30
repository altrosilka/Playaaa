angular.module('App')
  .directive('track', ['S_sound',function(S_sound) {
    return {
      scope:{
        info: '='
      },
      controller: 'CD_track as tctr',
      templateUrl: 'templates/directives/track.html',
      link: function($scope, $element, attrs, ctr){
        $element.on('click',function(){
          ctr.playTrack($scope.info);
        });
      }
    }
  }]);
