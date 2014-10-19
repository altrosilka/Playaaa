angular.module('App')
  .controller('C_artists.page', ['$q', '$stateParams', 'PS_lastfm', 'PS_self', function($q, $stateParams, PS_lastfm, PS_self) {
    var ctr = {};

    var artist = $stateParams.artist;


    $q.all({
      info: PS_lastfm.artist.getInfo(artist),
      albums: PS_lastfm.artist.getTopAlbums({artist:artist}),
      tags: PS_lastfm.artist.getTopTags(artist)
    }).then(function(resp) {
      console.log(resp);


      var src = resp.info.data.artist;
      ctr.artistInfo = {
        name: src.name,
        image: src.image[src.image.length - 1]['#text'],
        tags: resp.tags.data.toptags.tag.splice(0,7)
      }

      ctr.albums = resp.albums;
    });

    return ctr;
  }])
 