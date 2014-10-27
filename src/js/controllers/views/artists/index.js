angular.module('App')
  .controller('C_artists',['PS_echonest', 'PS_lastfm', 'S_reduce',function(PS_echonest, PS_lastfm, S_reduce){
    var ctr = {};
/*
    PS_echonest.getArtistRadio({artist: 'Каста'}).then(function(data){
      console.log(data);
    })
*/
    PS_lastfm.chart.getTopArtists(21).then(function(resp){
      ctr.artists = S_reduce.normalizeTopArtists(resp.data.artists.artist);
    })

    return ctr;
  }])