angular.module('App')
  .controller('C_artists.page', [
    '$q',
    '$scope',
    '$rootScope',
    '$stateParams',
    '$state',
    'PS_lastfm',
    'PS_self',
    'PS_vk',
    'PS_echonest',
    'S_reduce',
    'S_processing',
    'S_eventer',
    function($q, $scope, $rootScope, $stateParams, $state, PS_lastfm, PS_self, PS_vk, PS_echonest, S_reduce, S_processing, S_eventer) {
      var ctr = {};

      var artist = $state.params.artist;

      ctr.section = $state.params.section;

      $scope.$on('$stateChangeSuccess', function(event, toState, toParams) {
        ctr.section = toParams.section;
        ctr.loadInfo(ctr.section);
      });

      ctr.loadInfo = function(section) {
        S_processing.loading();
        switch (section) {
          case 'tracks':
            $q.all({
              tracks_vk: PS_vk.search({
                q: artist,
                count: 100,
                performer_only: 1
              }),
              tracks_last: PS_lastfm.artist.getTopTracks({
                artist: artist,
                limit: 100
              }),
              tracks: PS_echonest.getStaticPlaylist({
                artist: artist,
                type: 'artist',
                results: 100,
                bucket: 'song_hotttnesss',
                sort: 'song_hotttnesss-desc'
              }),
            }).then(function(resp) {


              var lastFmTracks = S_reduce.remapTracks(S_reduce.normalizeTopTracks(resp.tracks_last.data.toptracks.track));
              var echonestTracks = S_reduce.remapTracks(resp.tracks.data.response.songs, {
                artist: 'artist_name'
              });

              //ctr.searchTracks = (echonestTracks.length < 10) ? lastFmTracks : echonestTracks;

              ctr.searchTracks = resp.tracks_vk.response.items;
              S_processing.ready();
            });
            break;
          case 'albums':
            $q.all({
              albums: PS_lastfm.artist.getTopAlbums({
                artist: artist
              })
            }).then(function(resp) {
              ctr.albums = resp.albums;
              S_processing.ready();
            });
            break;
          case 'similar':
            $q.all({
              similar: PS_lastfm.artist.getSimilar(artist)
            }).then(function(data) {
              ctr.similarArtists = data.similar.splice(0, 6);
              S_processing.ready();
            });
            break;
          default:
            $q.all({
              _tracks: PS_vk.search({
                q: artist,
                performer_only: 1
              }),
              tracks: PS_echonest.getStaticPlaylist({
                artist: artist,
                type: 'artist',
                results: 10,
                bucket: 'song_hotttnesss',
                sort: 'song_hotttnesss-desc'
              }),
              tracks_last: PS_lastfm.artist.getTopTracks({
                artist: artist,
                limit: 10
              }),
              albums: PS_lastfm.artist.getTopAlbums({
                artist: artist,
                limit: 3
              })
            }).then(function(resp) {
              //ctr.searchTracks = S_reduce.filterTracks(resp.tracks.response.items).splice(0, 10);

              ctr.albums = resp.albums;

              var lastFmTracks = S_reduce.remapTracks(S_reduce.normalizeTopTracks(resp.tracks_last.data.toptracks.track));
              var echonestTracks = S_reduce.remapTracks(resp.tracks.data.response.songs, {
                artist: 'artist_name'
              }).splice(0, 10)

              ctr.searchTracks = (echonestTracks.length < 10) ? lastFmTracks : echonestTracks;

              S_processing.ready();
            });
            break;
        }
      }

      //      ctr.loadInfo(ctr.section);

      $q.all({
        info: PS_lastfm.artist.getInfo(artist),
        tags: PS_lastfm.artist.getTopTags(artist),
        publics: PS_vk.call('groups.search', {
          q: artist,
          fields: "members_count,verified,site",
          count: 3
        })
      }).then(function(resp) {

        var src = resp.info.data.artist;
        ctr.artistInfo = {
          name: src.name,
          image: src.image[src.image.length - 1]['#text'],
          tags: resp.tags.data.toptags.tag
        }
        S_eventer.sendEvent('artistInfoRecievedFromLF', ctr.artistInfo);
        ctr.publics = (resp.publics.response) ? resp.publics.response.items : [];
      });

      return ctr;
    }
  ])
