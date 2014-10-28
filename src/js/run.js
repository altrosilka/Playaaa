App.run(['$rootScope','PS_lastfm','S_sound','PS_vk',
  function($rootScope, PS_lastfm, S_sound, PS_vk) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
      $rootScope.status = 'loading';

      if (toState.name === 'flow'){
        $rootScope.isFlow = true;
      }
      if (fromState.name === 'flow'){
        $rootScope.isFlow = false;
      }

    });
  
    PS_vk.init();
    PS_vk.intro();
    S_sound.init();


  }
]);