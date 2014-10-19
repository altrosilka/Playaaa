angular.module('App')
  .controller('C_artists.page', ['$q', '$stateParams', 'PS_lastfm', 'PS_self', function($q, $stateParams, PS_lastfm, PS_self) {
    var ctr = {};

    var artist = $stateParams.artist;


    $q.all({
      info: PS_lastfm.artist.getInfo(artist),
      albums: PS_lastfm.artist.getTopAlbums({artist:artist})
    }).then(function(resp) {
      console.log(resp);

      var src = resp.info.artist;
      ctr.artistInfo = {
        name: src.name,
        image: src.image[src.image.length - 1]['#text']
      }

      ctr.albums = resp.albums;
    });

    return ctr;
  }])
 