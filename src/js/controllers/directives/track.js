angular.module('App').controller('CD_track', ['$scope', 'S_eventer', 'S_sound', function($scope, S_eventer, S_sound) {
  var ctr = this;


  ctr.thisIsCurrentTrack = function(){
    var soundId = S_sound.getSoundId();
    if (!soundId){
      return false;
    }

    return soundId === $scope.info.id;
  }
/*
  ctr.onStart = function(){
    console.log(1);
      S_eventer.sendEvent('trackDragStart');
  }

  ctr.onStop = function(){
    console.log(2);
      S_eventer.sendEvent('trackDragStop');
  }
*/

  return ctr;
}]);
  