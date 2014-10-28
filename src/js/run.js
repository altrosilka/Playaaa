App.run(['$rootScope','PS_lastfm','S_sound','PS_vk',
  function($rootScope, PS_lastfm, S_sound, PS_vk) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
      $rootScope.status = 'loading';
      
      if (toState.name === 'flow' || toState.name === 'share'){
        $rootScope.isRadio = true;
      }
      if (fromState.name === 'flow' || fromState.name === 'share'){
        $rootScope.isRadio = false;
      }
      $rootScope.state = toState.name;
    });
  
    PS_vk.init();
    PS_vk.intro();
    S_sound.init();


  }
]);