angular.module('App').controller('C_background', ['$state', '$scope', 'PS_lastfm', function($state, $scope, PS_lastfm) {
  var ctr = this;

  var defaultImage = '/images/background/intro.jpg'; 

  ctr.image = defaultImage;

  $scope.$on('artistInfoRecievedFromLF', function(event, info) {
    ctr.image = info.image;
  });

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
    if ((fromState.name === 'artistpage' || fromState.name === 'artistpage.section') && (toState.name !== 'artistpage' && toState.name !== 'artistpage.section')) {
      ctr.image = defaultImage;
    }
  });


  return ctr;
}]);
