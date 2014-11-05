angular.module('App')
  .service('S_logic', [
    '$rootScope',
    'S_reduce',
    function($rootScope, S_reduce) {
      var service = {};

      service.sortArtistPublics = function(artist, items){
        //TODO: подумать над сортировкой - теряются паблики с огромным кол-вом подписчиков и мусорными названиями
        var lower = artist.toLowerCase();
        return _.sortBy(items, function(pub) {
          if (pub.name.toLowerCase() === lower){
            return 0;
          } else {
            return 1/pub.members_count;
          }
        });
      }

      service.findTracksDatasource = function(artist, info) {
        var lastFmTracks = S_reduce.remapTracks(S_reduce.normalizeTopTracks(info.last.data.toptracks.track));
        var echonestTracks = S_reduce.remapTracks(info.echo.data.response.songs, {
          artist: 'artist_name'
        });
        var vkTracks = info.vk.response.items;

        var lastFmTrackArtist = (lastFmTracks[0]) ? lastFmTracks[0].artist : undefined;
        var echonestTrackArtist = (echonestTracks[0]) ? echonestTracks[0].artist : undefined;

        var tracks = [];

        if (echonestTrackArtist === artist) {
          tracks = (echonestTracks.length < 10) ? (lastFmTracks.length < 10) ? vkTracks : lastFmTracks : echonestTracks;
        } else if (lastFmTrackArtist === artist) {
          tracks = (lastFmTracks.length < 10) ? vkTracks : lastFmTracks;
        } else {
          tracks = vkTracks;
        }

        return tracks;
      }

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
