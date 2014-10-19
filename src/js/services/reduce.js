angular.module('App')
  .service('S_reduce', [
    '$rootScope',
    function($rootScope) {
      var service = {};

      service.normalizeTopTracks = function(array) {
        return _.reduce(array,function(newArray, song){
          newArray.push({
            artist: song.artist.name,
            title: song.name,
            duration: song.duration
          });
          return newArray;
        },[]); 
      }

      return service;
    }
  ]);
