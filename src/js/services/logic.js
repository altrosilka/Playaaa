angular.module('App')
  .service('S_logic', [
    '$rootScope',
    function($rootScope) {
      var service = {};

      service.findMostLikelyTrack = function(info, items) {
        var cycleCount = 2,
          itemsLength = items.length,
          realArtist = $.trim(info.artist),
          realTitle = $.trim(info.title),
          title, artist, duration, returnItem;


          for (var cycle = 0; cycle < cycleCount; cycle++) {
            if (returnItem){
              break;
            }
            _.forEach(items, function(item) {
              if (returnItem){
                return;
              }

              title = $.trim(item.title);
              artist = $.trim(item.artist);

              switch (cycle) {
                case 0:
                  if (title === realTitle && artist === realArtist) {
                    returnItem = item;
                  }
                  break;
                case 1:
                  if (title.toLowerCase() === realTitle.toLowerCase() && artist.toLowerCase() === realArtist.toLowerCase()) {
                    returnItem = item;
                  }
                  break;
              }
            });
          }

        if (!returnItem) {
          returnItem = items[0];
        }

        return returnItem;
      }

      return service;
    }
  ]);
