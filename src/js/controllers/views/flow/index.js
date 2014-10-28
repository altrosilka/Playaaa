angular.module('App')
  .controller('C_flow', [
    '$stateParams',
    '$scope',
    'PS_echonest',
    'PS_vk',
    'PS_lastfm',
    'S_utils',
    'S_processing',
    'S_reduce',
    'S_sound',
    'S_logic',
    function($stateParams, $scope, PS_echonest, PS_vk, PS_lastfm, S_utils, S_processing, S_reduce, S_sound, S_logic) {
      var ctr = {};

      ctr.isTag = ($stateParams.tag) ? true : false;
      ctr.typeLocale = (ctr.isTag) ? 'тегу' : 'исполнителю';
      ctr.query = ($stateParams.tag) ? $stateParams.tag : $stateParams.artist;

      ctr.songs = [];

      ctr.playing = false;
      if ($stateParams.artist && !$stateParams.tag) {
        var artist = $stateParams.artist;
        PS_echonest.getStaticPlaylist({
          artist: artist,
          results: 30 
        }).then(function(resp) {
          var q = {"response": {"status": {"version": "4.2", "code": 0, "message": "Success"}, "songs": [{"artist_id": "ARICLSK131AAE25F5E", "title": "Gods & Monsters", "id": "SOVXZSZ13B68643B24", "artist_name": "Lana Del Rey", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:b7539c32-53e7-4908-bda3-81449c367da6"}]}, {"artist_id": "AR15IO41187FB4D3FF", "title": "Not About Love", "id": "SOSLUAF12A8C132AF8", "artist_name": "Fiona Apple", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:a9ee533f-8871-4f62-a6bb-91eb264abc90"}]}, {"artist_id": "ARIANAQ127D395D74A", "title": "Blue Blue", "id": "SONNRFV14775B87530", "artist_name": "iamamiwhoami", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:9aaa99df-9383-47df-92af-8bb5e5595815"}]}, {"artist_id": "ARGHEC01187FB597B0", "title": "Love Me Like I'm Not Made Of Stone", "id": "SOAGLGT144C44CC8C3", "artist_name": "Lykke Li", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:cc7d4686-ea02-45fd-956e-94c1a322558c"}]}, {"artist_id": "ARZVDJU12592CDBBD3", "title": "Rill Rill", "id": "SOTZRRA12B5E4CF965", "artist_name": "Sleigh Bells", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:95f7536d-b2f7-4087-8668-a663ec201f5a"}]}, {"artist_id": "AR7WSXC1187FB37A2E", "title": "Let It Go", "id": "SOSCJQV1393B53033D", "artist_name": "Dragonette", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:00ef5e52-582b-4d53-a03a-bbd5b3084197"}]}, {"artist_id": "AR5B4GK1187FB536D1", "title": "Daniel", "id": "SOAZVCV127E943A188", "artist_name": "Bat for Lashes", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:10000730-525f-4ed5-aaa8-92888f060f5f"}]}, {"artist_id": "ARNCHOP121318C56B8", "title": "You've Got The Love", "id": "SOVXOTY13775C92ECD", "artist_name": "Florence + The Machine", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:5fee3020-513b-48c2-b1f7-4681b01db0c6"}]}, {"artist_id": "ARICLSK131AAE25F5E", "title": "National Anthem", "id": "SOHCOAO13665734859", "artist_name": "Lana Del Rey", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:b7539c32-53e7-4908-bda3-81449c367da6"}]}, {"artist_id": "AREMGDO1187FB5C4A2", "title": "Anywhere I Lay My Head", "id": "SOBMVAO12A8AE461D9", "artist_name": "Scarlett Johansson", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:0cc5ed91-eba3-4a5d-8a69-7638e0bf6495"}]}, {"artist_id": "ARQZBCO11E2835E38C", "title": "The Sun Ain't Shining No More", "id": "SODBDNS1312FE006DA", "artist_name": "The Asteroids Galaxy Tour", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:4661d98a-95bd-4cf1-a693-4f9f25691ada"}]}, {"artist_id": "AR6ENUY1187B994158", "title": "Chandelier", "id": "SOAJKLS144C3CB7CB2", "artist_name": "Sia", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:2f548675-008d-4332-876c-108b0c7ab9c5"}]}, {"artist_id": "ARRJRIS1187B9AD39C", "title": "Wings", "id": "SOJRYEH1416811E1DE", "artist_name": "Birdy", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:0da252d6-e962-4893-b9dd-7824496a1bb7"}]}, {"artist_id": "ARV4R211187B9ADA1C", "title": "Creation", "id": "SOBNOQT147E9974DE5", "artist_name": "The Pierces", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:9f4452f2-0451-455a-80c4-c873dda66eca"}]}, {"artist_id": "ARKZISD136658E6917", "title": "Hurricane", "id": "SOSUTOB13B245F00A8", "artist_name": "Ms Mr", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:f76691fd-82e6-4eb4-b1bb-1f1745f4c7d1"}]}, {"artist_id": "ARQEQMV129CDD179D8", "title": "Coming of Age", "id": "SOEHDZX143862F97D3", "artist_name": "Foster the People", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:e0e1a584-dd0a-4bd1-88d1-c4c62895039d"}]}, {"artist_id": "ARICLSK131AAE25F5E", "title": "Once Upon a Dream", "id": "SOYRQNF143CA83B0BD", "artist_name": "Lana Del Rey", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:b7539c32-53e7-4908-bda3-81449c367da6"}]}, {"artist_id": "ARUBJMV12086C16C1E", "title": "Primadonna", "id": "SORHIFC146277ED342", "artist_name": "Marina and The Diamonds", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:7f3d82ee-3817-4367-9eec-f33a312247a1"}]}, {"artist_id": "ARLLZVV12B68CA0491", "title": "Brokenhearted", "id": "SODWDOX1372F6221D5", "artist_name": "Karmin", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:a81303f1-64a5-4359-83ce-767f5fc3a542"}]}, {"artist_id": "AR15IO41187FB4D3FF", "title": "Hot Knife", "id": "SOGWPOD13B1CD565CC", "artist_name": "Fiona Apple", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:a9ee533f-8871-4f62-a6bb-91eb264abc90"}]}, {"artist_id": "ARD6VHG11C8A414FC6", "title": "Tigerlily", "id": "SOVFQSG12AB017E7D6", "artist_name": "La Roux", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:88d1360a-bc2d-47df-90d1-d2de285560aa"}]}, {"artist_id": "ARMCGHE11C8A415C87", "title": "Bruises", "id": "SOPOHIH12AB017D0F4", "artist_name": "Chairlift", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:a3cd61ef-7fd4-44af-a27f-99641a82b22b"}]}, {"artist_id": "ARDRTJT126A031DF17", "title": "Buffalo Flower", "id": "SONWUTY13B0CC6C0B3", "artist_name": "The Mynabirds", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:daa0c966-31a1-4754-b293-67ffe5b4ac18"}]}, {"artist_id": "ARQEQMV129CDD179D8", "title": "Helena Beat", "id": "SONJBYH130516E12B4", "artist_name": "Foster the People", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:e0e1a584-dd0a-4bd1-88d1-c4c62895039d"}]}, {"artist_id": "ARICLSK131AAE25F5E", "title": "Ride", "id": "SOBOMNA13C7A265904", "artist_name": "Lana Del Rey", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:b7539c32-53e7-4908-bda3-81449c367da6"}]}, {"artist_id": "ARKTTJV12592CDA07F", "title": "Starry Eyed", "id": "SODQRZE13167712FF8", "artist_name": "Ellie Goulding", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:33ca19f4-18c8-4411-98df-ac23890ce9f5"}]}, {"artist_id": "ARNAYWN128FFBAD713", "title": "Everything Is Embarrassing", "id": "SOKIHYX13AAD11E502", "artist_name": "Sky Ferreira", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:05f3353e-e2d9-4344-a3c9-8009dd8e0427"}]}, {"artist_id": "ARKZJ301187FB521B2", "title": "Smile", "id": "SOCDZPL13167715BAE", "artist_name": "Lily Allen", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:6e0c7c0e-cba5-4c2c-a652-38f71ef5785d"}]}, {"artist_id": "ARGHEC01187FB597B0", "title": "I Follow Rivers", "id": "SOJSMBP13678931C64", "artist_name": "Lykke Li", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:cc7d4686-ea02-45fd-956e-94c1a322558c"}]}, {"artist_id": "ARBYDBX12BEF24F439", "title": "White Nights", "id": "SOKWINQ12CE5F35A6D", "artist_name": "Oh Land", "artist_foreign_ids": [{"catalog": "musicbrainz", "foreign_id": "musicbrainz:artist:73700583-9245-4a62-b73b-68f3904a0ef3"}]}]}};
          createListeners(q.response.songs);
          //createListeners(resp.data.response.songs)
        });
      }

      if ($stateParams.tag && !$stateParams.artist) {
        var tag = $stateParams.tag;
        PS_echonest.getStaticPlaylist({
          results: 12,
          type: 'genre-radio',
          genre: tag
        }).then(function(resp) {
          createListeners(resp.data.response.songs);
        }, function() {
          PS_lastfm.tag.getTopTracks(tag).then(function(resp) {
            createListeners(S_reduce.normalizeTopTracks(resp.data.toptracks.track));
          });
        });
      }

      function createListeners(songs) {
        console.log(songs);
        ctr.playing = false;

        var filtTracks = getTracks(songs);

        PS_vk.findTrackArray(filtTracks, function(array, start) {
          console.log('part!');
          var tracks = [];
          $.each(array.response, function(i, val) {
            var pseudo = filtTracks[start + i];
            var q = S_logic.findMostLikelyTrack({artist: pseudo.artist, title: pseudo.title}, val.items);
            if (!q) {
              
              q = {
                error: true,
                artist: pseudo.artist,
                title: pseudo.title,
                duration: pseudo.duration
              }
            }
            tracks.push(q);
          });
          tracks = S_reduce.filterTracks(tracks, {
            withDurations: true
          });
          console.log(tracks);
          ctr.songs = ctr.songs.concat(tracks);

          if (!ctr.playing && ctr.songs.length > 0) {
            ctr.playing = true;
            if (soundManager.ok()) {
              S_sound.createAndPlay(ctr.songs[0]);
            } else {
              S_sound.onload = function() {
                S_sound.createAndPlay(ctr.songs[0]);
              }
            }
          }
        }, function() {
          S_processing.ready();
        });
      }

      function getTracks(tracks) {
        var filteredTracks = [];
        for (var i = 0, l = tracks.length; i < l; i++) {
          var track = tracks[i];
          filteredTracks.push({
            artist: track.artist_name || track.artist,
            title: track.title
          });
        }
        return filteredTracks;
      }



      function getArtistImage(artist) {
        PS_lastfm.artist.getInfo(artist).then(function(resp) {
          var src = resp.data.artist;

          if (!src || !src.image || src.image[src.image.length - 1]['#text'] === '') {
            var t = new Trianglify();
            var pattern = t.generate(document.body.clientWidth, document.body.clientHeight);
            console.log(pattern.dataUri);
            ctr.artistInfo = {
              name: artist,
              image: pattern.dataUri
            }
          } else {
            ctr.artistInfo = {
              name: src.name,
              image: src.image[src.image.length - 1]['#text']
            }
          }


        });
      }

      $scope.$on('trackStarted', function(event, info) {
        getArtistImage(info.artist);
      })

      return ctr;
    }
  ])
