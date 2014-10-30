angular.module('App')
  .controller('C_discover', ['$q', '$stateParams', 'PS_echonest', 'PS_vk', 'S_reduce', 'S_processing', function($q, $stateParams, PS_echonest, PS_vk, S_reduce, S_processing) {
    var ctr = {};

    ctr.searchMode = ($stateParams.q) ? true : false;

    ctr.query = $stateParams.q;


    $q.all({
      tracks: PS_vk.search({
        q: ctr.query,
        count: 100,
        performer_only: 0
      }),
    }).then(function(resp) {
      ctr.searchTracks = S_reduce.filterTracks(resp.tracks.response.items);

      S_processing.ready();
    });

    return ctr;
  }])
