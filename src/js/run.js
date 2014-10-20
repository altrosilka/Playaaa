App.run(['$rootScope','PS_lastfm','S_sound','PS_vk',
  function($rootScope, PS_lastfm, S_sound, PS_vk) {
    $rootScope.$on('$stateChangeStart', function() {
      $rootScope.status = 'loading';
    });
  
    PS_vk.init();
    PS_vk.intro();
    S_sound.init();
  }
]);