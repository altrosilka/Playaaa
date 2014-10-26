App
  .constant('__vkAppId', 4468735)
  .constant('__echonest', {
    key: 'JPIQUINIHEVVTYYRU',
    url: 'http://developer.echonest.com/api/v4/'
  })
  .constant('__lastfm', {
    url: 'http://ws.audioscrobbler.com/2.0/',
    keys: {
      "api": "3b716084894fd83886ebe8a20df6bdf0",
      "secret": "abda2711d758f43cbbede5942541f97f"
    }
  })
  .constant('__api',{
    url: 'http://api.playaaa.dev:8080',
    paths: {
      translationTrackMp3: '/track/translate/',
      getTrackTranslationData: '/track/getData/',
      getTopArtists: '/artists/top'
    }
  })
  .constant('localization',{
    months: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  })
