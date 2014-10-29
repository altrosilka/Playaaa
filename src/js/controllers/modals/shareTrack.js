angular.module('App').controller('Cm_shareTrack', ['$scope', 'trackInfo', '__domain', function($scope, trackInfo, __domain) {
  var ctr = this;
  ctr.trackUrl = __domain + '/share/track/' + trackInfo.owner_id + '_' + trackInfo.id;
  console.log(trackInfo);
}]);
