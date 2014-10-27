angular.module('App').controller('C_playlist', [function() {
  var ctr = this;
 

  ctr.onDragStart = function(){
    ctr.inDrag = true;
  }

  ctr.onDragStop = function(){
    ctr.inDrag = false;
  }

  ctr.currentTrackList = [];

  ctr.onOver = function(){
    console.log(3);
  }
  ctr.onDrop = function(q,w,e,r){
    console.log(q,w,e,r);
  }

  return ctr;
}]);
  