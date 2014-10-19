angular.module('App')
  .controller('C_discover',['PS_echonest', 'PS_self', function(PS_echonest, PS_self){
    var ctr = {};
/*
    PS_echonest.getArtistRadio({artist: 'Каста'}).then(function(data){
      console.log(data);
    })
*/
    PS_self.getHotArtists().then(function(data){
      ctr.artists = data.data.artists;
    })

    return ctr;
  }])