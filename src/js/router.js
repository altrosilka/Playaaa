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
        url: "/discover/?q",
        controller: 'C_discover as ctr',
        templateUrl: "templates/views/discover/index.html"
      })
      .state('artists', {
        url: "/artists/",
        controller: 'C_artists as ctr',
        templateUrl: "templates/views/artists/index.html"
      })
      .state('artistpage', {
        url: "/artists/:artist/",
        controller: 'C_artists.page as ctr',
        templateUrl: "templates/views/artists/page.html"
      })
        .state('artistpage.section', {
          url: ":section/"
        })
      .state('lib', {
        url: "/lib/",
        controller: 'C_lib as ctr',
        templateUrl: "templates/views/lib/index.html"
      }) 
        .state('lib.section', {
          url: ":section/"
        })
      .state('wave', {
        url: "/wave/?artist&tag",
        controller: 'C_wave as ctr',
        templateUrl: "templates/views/wave/index.html",
        reloadOnSearch: false,
        resovle: {
          ready: function() {
            var deferred = $q.defer();
            setTimeout(function(){
              deferred.resolve(true);
            },500);
            return deferred.promise;
          }
        }
      })
      .state('charts', {
        url: "/charts/",
        controller: 'C_charts as ctr',
        templateUrl: "templates/views/charts/index.html"
      })
        .state('chartspage', {
          url: "/charts/:chartName/",
          controller: 'C_charts.page as ctr',
          templateUrl: "templates/views/charts/page.html"
        })
      .state('share', {
        url: "/share/:type/:id",
        controller: 'C_share as ctr',
        templateUrl: "templates/views/share/index.html"
      })
      .state('album', {
        url: "/album/:artist/:albumName",
        controller: 'C_album as ctr',
        templateUrl: "templates/views/album/index.html"
      })
      .state('public', {
        url: "/public/:id/?album_id",
        controller: 'C_public as ctr',
        templateUrl: "templates/views/public/page.html",
        reloadOnSearch: false
      })
  }
]);
