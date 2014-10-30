App.run(['$rootScope','PS_lastfm','S_sound','PS_vk','PS_self',
  function($rootScope, PS_lastfm, S_sound, PS_vk, PS_self) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
      $rootScope.status = 'loading';
      
      if (toState.name === 'wave' || toState.name === 'share'){
        $rootScope.isRadio = true;
      }
      if (fromState.name === 'wave' || fromState.name === 'share'){
        $rootScope.isRadio = false;
      }
      $rootScope.state = toState.name;
    });
  
    PS_vk.init();
    PS_vk.intro();
    S_sound.init();

    PS_self.addTrackToHistory();
  }
]);