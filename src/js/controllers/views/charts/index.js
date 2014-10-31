angular.module('App')
  .controller('C_charts', [
    '$stateParams',
    '$scope',
    'PS_echonest',
    'S_utils',
    function($stateParams, $scope, PS_echonest, S_utils) {
      var ctr = {};


      var dance = ['dance pop', 'electropowerpop', 'italian disco', 'disco', 'progressive trance', 'dance rock']
      var electric = ['electric blues', 'electro', 'electro dub', 'electro house', 'electro jazz', 'electro latino', 'electro swing', 'electro trash', 'electro-industrial', 'electroacoustic improvisation', 'electroclash', 'electrofox', 'electronic', 'electronica', 'electronicore', 'goa trance', 'trance', 'trance hop', 'minimal', 'minimal dub', 'minimal dubstep', 'minimal melodic techno', 'minimal techno', 'minimal wave', 'breakbeat', 'techno', 'drum and bass', 'dubstep', 'experimental', 'experimental dubstep', 'experimental psych', 'experimental rock', 'mashup'];


      var phone = ['chill groove', 'chill lounge', 'chill-out', 'chill-out trance', 'chillstep', 'chillwave', 'new age', 'new age piano', 'ambient', 'ambient dub techno', 'ambient fusion', 'ambient idm', 'ambient psychill', 'ambient trance', 'organic ambient', 'deep house', 'acoustic blues', 'acoustic pop', 'easy listening', 'sexy']


      var pop = ['eurovision', 'europop', 'britpop', 'dream pop', 'french pop', 'popfuture', 'indie pop', 'pop'];

      var rock = ['album rock', 'alternative rock', 'classic rock', 'country rock', 'garage rock', 'glam rock', 'hard rock', 'indie rock', 'j-rock', 'noise rock', 'rock', 'soft rock'];

      var jazz = ['soul jazz', 'vocal jazz', 'cool jazz', 'jazz blues', 'jazz', 'smooth jazz', 'blues', 'soul blues', 'swing'];

      var rap = ['underground rap', 'west coast rap', 'dirty south rap', 'dirty texas rap', 'gangster rap', 'pop rap', 'rap', 'hip hop', 'hardcore hip hop', 'old school hip hop', 'russian hip hop', 'underground hip hop', 'r&b', 'trap music'];

      ctr.sections = [{
        title: "Танцевальные",
        array: dance
      }, {
        title: "Электро",
        array: electric
      }, {
        title: "Фоновые",
        array: phone
      }, {
        title: "Поп",
        array: pop
      }, {
        title: "Рок",
        array: rock
      }, {
        title: "Джаз / Блюз",
        array: jazz
      }, {
        title: "Рэп / Хип Хоп",
        array: rap
      }];

      PS_echonest.getGenresList({
        results: 2000
      }).then(function(resp) {
        ctr.genreList = resp.data.response.genres;
      });

      return ctr;
    }
  ])
