angular.module('App').controller('C_album', ['$stateParams', 'PS_lastfm', 'PS_vk','S_reduce',function($stateParams, PS_lastfm, PS_vk, S_reduce) {

  var ctr = this;

  var artist = $stateParams.artist;
  var albumName = $stateParams.albumName;



  ctr.audios = [];

  ctr.tracksPlurals = {
    0: 'нет треков',
    one: '{} трек',
    few: '{} трека',
    many: '{} треков',
    other: '{} треков'
  };


  PS_lastfm.album.getInfo({
    artist: artist,
    album: albumName
  }).then(function(data) {
    ctr.info = data;

    var filtTracks = getTracks(data);
    
    PS_vk.findTrackArray(filtTracks, function(array, start) {
      console.log('part!');
      var tracks = [];
      $.each(array.response, function(i, val) {
        var q = val.items[0];
        if (!q) {
          var pseudo = filtTracks[start + i];
          q = {
            error: true,
            artist: pseudo.artist,
            title: pseudo.title,
            duration: pseudo.duration
          }
        }
        tracks.push(q);
      });
      tracks = S_reduce.filterTracks(tracks);
      ctr.audios = ctr.audios.concat(tracks);


    }, function() {
      console.log('all!');
    });
  });


  function getTracks(data) {
    var filteredTracks = [];
    for (var i = 0, l = data.tracks.track.length; i < l; i++) {
      var track = data.tracks.track[i];
      filteredTracks.push({
        artist: track.artist.name,
        title: track.name,
        duration: track.duration
      });
    }

    if (typeof data.tracks.track.length === 'undefined'){
      filteredTracks.push(data.tracks.track); 
    }

    return filteredTracks;
  }

}]);
