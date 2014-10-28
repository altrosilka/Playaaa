angular.module('App')
  .controller('C_share', [
    '$stateParams',
    '$scope',
    'PS_self',
    'PS_vk',
    'PS_lastfm',
    'S_sound',
    'S_processing',
    'S_eventer',
    function($stateParams, $scope, PS_self, PS_vk, PS_lastfm, S_sound, S_processing, S_eventer) {
      var ctr = {};

      var type = $stateParams.type;
      var id = $stateParams.id;

      if (type === 'track') {

        function sendEvent() {
          S_eventer.sendEvent('shareScreenTrack');
        }

        $scope.$on('badAuthorization', function() {
          PS_self.getTrackTranslationData(id).then(function(resp) {
            sendEvent();
            S_processing.ready();
            if (!resp.data.error) {
              var obj = angular.extend(resp.data, {
                url: PS_self.getTranslationUrl(resp.data.url)
              });
              getArtistImage(obj.artist);
              if (soundManager.ok()) {
                S_sound.createAndPlay(obj);
              } else {
                S_sound.onload = function() {
                  S_sound.createAndPlay(obj);
                }
              }

            }
          });
        });

        $scope.$on('userLogin', function() {
          if (ctr.iAmHere){
            return;
          }
          PS_vk.call('audio.getById', {
            audios: id
          }).then(function(resp) {
            sendEvent();
            S_processing.ready();
            var obj = resp.response[0];
            if (!obj) {
              alert('ID error');
              return;
            }
            getArtistImage(obj.artist);
            if (soundManager.ok()) {
              S_sound.createAndPlay(obj);
            } else {
              S_sound.onload = function() {
                S_sound.createAndPlay(obj);
              }
            }
          });
        });
      }


      function getArtistImage(artist) {
        PS_lastfm.artist.getInfo(artist).then(function(resp) {
          var src = resp.data.artist;
          if (!src || !src.image || src.image[src.image.length - 1]['#text'] === '') {
            var t = new Trianglify();
            var pattern = t.generate(document.body.clientWidth, document.body.clientHeight);
            ctr.image = pattern.dataUri;
          } else {
            ctr.image = src.image[src.image.length - 1]['#text']
          }
        });
      }

      ctr.auth = function() {
        ctr.iAmHere = true;
        PS_vk.authorize();
      }

      $scope.$on('userLogin', function() {
        ctr.hideIntroButton = true;
      });

      return ctr;
    }
  ])
