angular.module('App')
  .controller('C_artists',['$q','PS_echonest', 'PS_lastfm', 'S_reduce',function($q,PS_echonest, PS_lastfm, S_reduce){
    var ctr = {};
/*
    PS_echonest.getArtistRadio({artist: 'Каста'}).then(function(data){
      console.log(data);
    })
*/
    ctr.limits = {
      hyped: 6,
      artists: 6
    }

    $q.all({
      artists: PS_lastfm.chart.getTopArtists(21),
      hyped: PS_lastfm.chart.getHypedArtists(21)
    }).then(function(resp){
      ctr.artists = S_reduce.normalizeTopArtists(resp.artists.data.artists.artist);
      ctr.hypedArtists = S_reduce.normalizeTopArtists(resp.hyped.data.artists.artist);
    })

    return ctr;
  }])