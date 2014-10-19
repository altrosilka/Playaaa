App.config([
  '$stateProvider', 
  '$urlRouterProvider', 
  '$locationProvider', 
  '$httpProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf8';

    $locationProvider.html5Mode(true).hashPrefix('!');

    $urlRouterProvider.otherwise("/discover");

    $stateProvider
      .state('discover', {
        url: "/discover/",
        controller: 'C_discover as ctr',
        templateUrl: "templates/views/discover/index.html"
      })
      .state('artists', {
        url: "/artists/",
        controller: 'C_artists as ctr',
        templateUrl: "templates/views/artists/index.html"
      })
      .state('artistpage', {
        url: "/artists/:artist",
        controller: 'C_artists.page as ctr',
        templateUrl: "templates/views/artists/page.html", 
        reloadOnSearch: false
      })
      .state('flow', {
        url: "/flow/?artist&tag",
        controller: 'C_flow as ctr',
        templateUrl: "templates/views/flow/index.html", 
        reloadOnSearch: false
      })
  }
]);