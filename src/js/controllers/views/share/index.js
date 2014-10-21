angular.module('App')
  .controller('C_share', [
    '$stateParams',
    '$scope',
    'PS_self',
    'PS_vk',
    'S_sound',
    '__api',
    function($stateParams, $scope, PS_self, PS_vk, S_sound, __api) {
      var ctr = {};

      var type = $stateParams.type;
      var id = $stateParams.id;

      if (type === 'track') {
        PS_self.getTrackTranslationData(id).then(function(resp) {
          console.log(resp);
          if (!resp.data.error) {
            var obj = angular.extend(resp.data, {
              url: PS_self.getTranslationUrl(resp.data.url)
            });
            if (soundManager.ok()) {
              S_sound.createAndPlay(obj);
            } else {
              S_sound.onload = function() {
                S_sound.createAndPlay(obj);
              }
            }

          }
        });
      }
      console.log();

      return ctr;
    }
  ])
