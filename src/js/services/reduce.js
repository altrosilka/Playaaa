angular.module('App')
  .service('S_reduce', [
    '$rootScope',
    function($rootScope) {
      var service = {};


      service.remapTracks = function(array, remap){
        remap = angular.extend({artist: 'artist', title: 'title'}, remap);
        var titleInfo, artistInfo;
        return _.map(array, function(track) {
          artistInfo = service.extractFeats(track[remap.artist]);
          titleInfo = service.extractFeats(track[remap.title]);

          return {
            title: titleInfo.text,
            artist: artistInfo.text,
            feat:  titleInfo.feat || artistInfo.feat
          }
        });
      }

      service.normalizeTopArtists = function(array) {
        return _.map(array, function(artist) {
          return {
            name: artist.name,
            listeners: artist.listeners,
            image: artist.image[artist.image.length - 1]['#text']
          }
        });
      }

      service.normalizeTopTracks = function(array) {
        return _.reduce(array, function(newArray, song) {
          newArray.push({
            artist: song.artist.name,
            title: song.name,
            duration: song.duration
          });
          return newArray;
        }, []);
      }

      service.filterTracks = function(items, allowOptions) {
        allowOptions = angular.extend({
          bigTitles: false,
          withDurations: true
        }, allowOptions || {});

        var filteredItems = [];
        for (var l = items.length, i = 0; i < l; i++) {
          var item = items[i];
          var title = service.clearTrashSymbols(item.title);

          if (!allowOptions.withDurations || (typeof item.duration !== 'undefined' && allowOptions.withDurations)) {
            if (allowOptions.bigTitles || (!allowOptions.bigTitles && item.title.length < 50)) {

              var titleInfo = service.extractFeats(title);
              var artistInfo = service.extractFeats(service.clearTrashSymbols(item.artist));
              item.title = titleInfo.text;
              item.feat = titleInfo.feat || artistInfo.feat;
              item.artist = artistInfo.text;
              filteredItems.push(item);
            }
          }
        };

        return filteredItems;
      }

      service.extractFeats = function(text) {
        var array = [
          /(.*)\sft\s(.*)/i, 
          /(.*)\sft\.\s(.*)/i, 
          /(.*)\sft\.(.*)/i, 
          /(.*)\(ft\.(.*)/i, 
          /(.*)\(ft\s(.*)/i, 
          /(.*)\sfeat\.\s(.*)/i,
          /(.*)\sfeat\.(.*)/i,
          /(.*)\sfeat\s(.*)/i,
          /(.*)\(feat\.\s(.*)\)/i,
          /(.*)\(feat\.(.*)\)/i,
          /(.*)\(feat\s(.*)\)/i,
          ];
        var name, features, execResult, completed;

        _.forEach(array, function(reg) {
          if (!completed) {
            execResult = reg.exec(text);
            if (_.isArray(execResult)){
              completed = true;
              name = execResult[1];
              features = execResult[2];
            }
          }
        });
        if (!name){
          name = text;
        }
        return {
          text: name,
          feat: features
        }
      }

      service.clearTrashSymbols = function(text) {
        var filt = ["♫", "►", "=", "♥", " ]", "★", "™", "║", "●", "✖"];
        text = text.replace(new RegExp("[0-9]+[.]", 'g'), "");
        text = text.replace(new RegExp("^[0-9]+[ ]", 'g'), "");
        text = text.replace(new RegExp("[(][0-9]+[)]", 'g'), "");
        text = text.replace(new RegExp("[(][.]+[)]", 'g'), "");
        text = text.replace(new RegExp("www.[0-9^ ]*", 'g'), "");
        text = text.replace(new RegExp("club[^ ]*", 'g'), "");
        text = text.replace(new RegExp("ё", 'g'), "е");
        text = text.replace(/([^ ]*\.ru)/g, "");
        text = text.replace(/\[[^]*\]/g, "");

        for (var k = 0; k < filt.length; k++)
          text = text.replace(new RegExp(filt[k], 'g'), "");
        return text;
      }

      return service;
    }
  ]);
