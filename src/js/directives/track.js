angular.module('App')
  .directive('track', ['S_sound',function(S_sound) {
    return {
      scope:{
        info: '='
      },  
      controller: 'CD_track as tctr',
      templateUrl: 'templates/directives/track.html',
      link: function($scope, $element){
        $element.on('click',function(){
          S_sound.createAndPlay($scope.info);
        });
      }
    }
  }]);
