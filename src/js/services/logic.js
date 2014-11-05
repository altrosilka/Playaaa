angular.module('App')
  .service('S_logic', [
    '$rootScope',
    function($rootScope) {
      var service = {};

      service.findMostLikelyTrack = function(info, items) {
        var cycleCount = 3,
          itemsLength = items.length,
          realArtist = $.trim(info.artist),
          realTitle = $.trim(info.title),
          lowerCaseRealArtist = realArtist.toLowerCase(),
          lowerCaseRealTitle = realTitle.toLowerCase(),
          title, artist, duration, returnItem, lowerCaseArtist, lowerCaseTitle;


        for (var cycle = 0; cycle < cycleCount; cycle++) {
          if (returnItem) {
            break;
          }
          _.forEach(items, function(item) {
            if (returnItem) {
              return;
            }

            title = $.trim(item.title);
            artist = $.trim(item.artist);
            lowerCaseArtist = artist.toLowerCase();
            lowerCaseTitle = title.toLowerCase();

            switch (cycle) {
              case 0:
                if (title === realTitle && artist === realArtist) {
                  returnItem = item;
                }
                break;
              case 1:
                if (lowerCaseTitle === lowerCaseRealTitle && lowerCaseArtist === lowerCaseRealArtist) {
                  returnItem = item;
                }
                break;
              case 2:
                if (lowerCaseTitle.indexOf('original') !== -1) {
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
