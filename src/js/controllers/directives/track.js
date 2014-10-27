angular.module('App').controller('CD_track', ['$scope', 'S_eventer', function($scope, S_eventer) {
  var ctr = this;


  ctr.onStart = function(){
    console.log(1);
      S_eventer.sendEvent('trackDragStart');
  }

  ctr.onStop = function(){
    console.log(2);
      S_eventer.sendEvent('trackDragStop');
  }


  return ctr;
}]);
  