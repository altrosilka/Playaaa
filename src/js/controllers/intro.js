angular.module('App').controller('C_intro', ['$state', '$scope', '$timeout', 'PS_vk', function($state, $scope, $timeout, PS_vk) {
  var ctr = this;

  $scope.$on('userLogin', function(event, info) {
    $scope.$apply(function() {
      ctr.userName = info.name;
      $timeout(function() {
        ctr.hideIntro = true;
        $timeout(function() {
          ctr.removeIntro = true;
        }, 550);
      }, 2000);
    });
  });

  $scope.$on('shareScreenTrack', function(event) {
    ctr.hideIntro = true;
    $timeout(function() {
      ctr.removeIntro = true;
    }, 550);
  });

  $scope.$on('badAuthorization', function(event, info) {
    $scope.$apply(function() {
      ctr.needAuth = true;
    });
  });

  ctr.authorize = function() {
    PS_vk.authorize();
    ctr.needAuth = false;
  }

  return ctr;
}]);
