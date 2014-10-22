angular.module('App')
  .controller('C_artists.page', [
    '$q',
    '$stateParams',
    'PS_lastfm',
    'PS_self',
    'PS_vk',
    'S_reduce',
    function($q, $stateParams, PS_lastfm, PS_self, PS_vk, S_reduce) {
      var ctr = {};

      var artist = $stateParams.artist;

      $q.all({
        info: PS_lastfm.artist.getInfo(artist),
        albums: PS_lastfm.artist.getTopAlbums({
          artist: artist
        }),
        tags: PS_lastfm.artist.getTopTags(artist),
        tracks: PS_vk.search({
          q: artist
        })
      }).then(function(resp) {
        console.log(resp);




        var src = resp.info.data.artist;
        ctr.artistInfo = {
          name: src.name,
          image: src.image[src.image.length - 1]['#text'],
          tags: resp.tags.data.toptags.tag.splice(0, 7)
        }

        ctr.searchTracks = S_reduce.filterTracks(resp.tracks.response.items).splice(0,10);

        ctr.albums = resp.albums;
      });

      return ctr;
    }
  ])
