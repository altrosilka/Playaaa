angular.module('App').controller('CD_track', [
  '$scope',
  'S_eventer',
  'S_sound',
  'S_logic',
  'PS_vk',
  function($scope, S_eventer, S_sound, S_logic, PS_vk) {
    var ctr = this;

    ctr.playTrack = function(info) {
      if (!info.url) {
        console.log(new Date().getTime());
        PS_vk.search({
          q: info.artist + ' ' + info.title,
          count: 100
        }).then(function(resp) {
          if (!resp.response || resp.response.items.length === 0) {
            //TODO: create normal error
            console.log('bad');
            return;
          }

          var q = S_logic.findMostLikelyTrack({
            artist: info.artist,
            title: info.title
          }, resp.response.items);

          S_sound.createAndPlay(q);
        })
      } else {
        S_sound.createAndPlay(info);
      }
    }

    ctr.thisIsCurrentTrack = function() {
        var soundId = S_sound.getSoundId();
        if (!soundId) {
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
  }
]);
