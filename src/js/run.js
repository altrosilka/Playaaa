App.run(['$rootScope','PS_lastfm','S_sound','PS_vk',
  function($rootScope, PS_lastfm, S_sound, PS_vk) {
    $rootScope.$on('$stateChangeStart', function() {
      $rootScope.status = 'loading';
    });
  
    PS_vk.init();
    S_sound.init();
    PS_lastfm.init();
  }
]);