angular.module('App')
  .controller('C_discover',['$stateParams','PS_echonest', 'PS_self', function($stateParams, PS_echonest, PS_self){
    var ctr = {};

    ctr.searchMode = ($stateParams.q)?true:false;

    ctr.query = $stateParams.q;

    PS_self.getHotArtists().then(function(data){
      ctr.artists = data.data.artists;
    })

    return ctr;
  }])