angular.module('App')
  .controller('C_public', [
    '$stateParams',
    '$q',
    '$scope',
    '$state',
    'PS_vk',
    'PS_echonest',
    function($stateParams, $q, $scope, $state, PS_vk, PS_echonest) {
      var ctr = {};

  
      ctr.activeAlbum = +$state.params.album_id;

      PS_vk.call('groups.getById',{group_id: $stateParams.id, fields: 'description,verified,activity'}).then(function(resp){
        if (resp.response){
          ctr.public = resp.response[0];

          PS_echonest.extractArtists(ctr.public.name).then(function(resp){
            ctr.parsedArtists = resp.data.response.artists.splice(0,1);
          });

          $q.all({
            audios: PS_vk.call('audio.get',{owner_id: '-' + $stateParams.id, count: 100, album_id: $stateParams.album_id }),
            albums: PS_vk.call('audio.getAlbums',{owner_id: '-' + $stateParams.id })
          }).then(function(resp){
            ctr.songs = resp.audios.response.items;

            if (resp.albums.response.count > 0){
              ctr.albums = resp.albums.response.items;
            }
          });

        }  else {
          alert('Error while loading!');
        }
      });
      
      

      ctr.loadAlbum = function(id){
        ctr.activeAlbum = id;
        PS_vk.call('audio.get',{owner_id: '-' + $stateParams.id, album_id: id }).then(function(resp){
          ctr.songs = resp.response.items;
        });
      }

      return ctr;
    }
  ])
