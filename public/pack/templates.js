angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("templates/modals/shareTrack.html","<div class=\"modal-header\">\n  <h3 class=\"modal-title\">Поделиться композицией</h3>\n</div> \n<div class=\"modal-body\">\n  <input type=\"text\" ng-model=\"ctr.trackUrl\" style=\"width:100%;\" onfocus=\"this.select()\">\n</div>\n<div class=\"modal-footer\">\n  <button class=\"btn btn-primary\" ng-click=\"$close()\">Закрыть</button>\n</div>\n ");
$templateCache.put("templates/modals/vkCaptcha.html","<div class=\"modal-header\">\n  <h3 class=\"modal-title\">Реши капчу</h3>\n</div>\n<div class=\"modal-body\">\n  Для продолжения работы нужно ввести код с картинки:\n  <img ng-src=\"{{imageUrl}}\" /> \n  <input autofocus type=\"text\" ng-model=\"code\">\n</div>\n<div class=\"modal-footer\">\n  <button class=\"btn btn-primary\" ng-click=\"$close(code)\">OK</button>\n  <button class=\"btn btn-link pull-left\" ng-click=\"$dismiss()\">Отменить</button>\n</div>\n");
$templateCache.put("templates/directives/albumImage.html","<a href=\"/album/{{info.artist.name}}/{{info.name}}\" class=\"albumImage\">\n  <div class=\"img\" style=\"background-image:url({{info.albumImage}})\"></div>\n  <div class=\"overlay\">\n    <span class=\"title\">{{info.artist.name}} - {{info.name}}</span>\n  </div>\n</div>  ");
$templateCache.put("templates/directives/lineLoader.html","<div class=\"lineLoader\">\n  <div class=\"lineLoaderPoint lineLoaderPoint_1\"></div> \n  <div class=\"lineLoaderPoint lineLoaderPoint_2\"></div>\n  <div class=\"lineLoaderPoint lineLoaderPoint_3\"></div>\n</div>\n");
$templateCache.put("templates/directives/minutesScaler.html","<div></div>");
$templateCache.put("templates/directives/track.html","<div class=\"track\" ng-class=\"{\'active\':tctr.thisIsCurrentTrack()}\" ddata-drag=\"true\" ddata-jqyoui-options=\"{revert: true}\" djqyoui-draggable=\"{onStart: \'tctr.onStart\', onStop: \'tctr.onStop\'}\" dng-model=\"info\">\n  <span class=\"play\">\n   	<i class=\"fa fa-play\"></i> \n  </span>\n  <span class=\"time\">{{info.duration | toGIS}}</span>\n  <span class=\"bitrate\" ng-show=\"bitrate\">{{bitrate | formatBitrate}}</span>\n  <span class=\"text\">\n    <span class=\"artist\">{{info.artist}}</span>\n    &nbsp;–&nbsp;\n    <span class=\"title\">{{info.title}}</span>\n  </span>\n</div>\n");
$templateCache.put("templates/views/album/index.html","<section id=\"view-album\">\n\n  <header class=\"whiteHeader column\">\n    <div class=\"top\">\n      <h1>\n        <a class=\"link no-border\" href=\"/artists/{{ctr.info.artist}}/\" ng-bind=\"ctr.info.artist\"></a>\n      </h1>\n      <h2>\n        <span ng-bind=\"ctr.info.name\"></span>\n        <span class=\"gray\" ng-if=\"ctr.info.releasedate\">Дата релиза: <b>{{ctr.info.releasedate | lastfmDateToLocal}}</b>\n        </span>\n      </h2>\n\n      <div class=\"image\" ng-style=\"{\'background-image\':\'url(\'+ctr.info.albumImage+\')\'}\"></div>\n    </div>\n  </header>\n\n\n  <div class=\"column inner\">\n    <h2>Композиции с альбома\n      <small class=\"pull-right\">\n        <div ng-pluralize count=\"ctr.audios.length\" when=\"ctr.tracksPlurals\"></div>\n      </small>\n    </h2>\n    <div class=\"tracks\">\n      <div track ng-repeat=\"item in ctr.audios\" info=\"item\"></div>\n    </div>\n  </div>\n</section>\n");
$templateCache.put("templates/views/artists/index.html","<section class=\"view view-fullsize\">\n  <div class=\"column inner\">\n    <h2>Популярные исполнители</h2>\n    <section class=\"list list-gray artistGrid clearfix\">\n      <a class=\"item\" href=\"/artists/{{item.name}}/\" ng-repeat=\"item in ctr.artists | limitTo:ctr.limits.artists\">\n        <div class=\"image\" ng-style=\"{\'background-image\': \'url(\'+item.image+\')\'}\"></div>\n        <footer>\n          <h3 ng-bind=\"item.name\"></h3>\n          <span class=\"gray\">Сейчас\n            <strong ng-bind=\"item.listeners\"></strong>\n            слушателя\n          </span>\n        </footer>\n      </a>\n    </section>\n  </div>\n\n  <div class=\"column inner\">\n    <h2>Набирающие популярность</h2>\n    <section class=\"list list-gray artistGrid clearfix\">\n      <a class=\"item\" href=\"/artists/{{item.name}}/\" ng-repeat=\"item in ctr.hypedArtists | limitTo:ctr.limits.hyped\">\n        <div class=\"image\" ng-style=\"{\'background-image\': \'url(\'+item.image+\')\'}\"></div>\n        <footer>\n          <h3 ng-bind=\"item.name\"></h3>\n        </footer>\n      </a>\n    </section>\n  </div>\n</section>\n");
$templateCache.put("templates/views/artists/page.html","<section id=\"view-artists-page\" class=\"view view-fullsize\" ng-if=\"ctr.artistInfo\">\n  <header class=\"whiteHeader column\">\n    <div class=\"fullsizeImage\" ng-style=\"{\'background-image\':\'url(\'+ctr.artistInfo.image+\')\'}\"></div>\n    <div class=\"top\">\n      <h1>\n        <span ng-bind=\"ctr.artistInfo.name\"></span>\n      </h1>\n      <menu>\n        <a href=\"/artists/{{ctr.artistInfo.name}}/tracks/\" ng-class=\"{\'active\':ctr.section === \'tracks\'}\">Композиции</a>\n        <a href=\"/artists/{{ctr.artistInfo.name}}/albums/\" ng-class=\"{\'active\':ctr.section === \'albums\'}\">Альбомы</a>\n        <!--<a href=\"/artists/{{ctr.artistInfo.name}}/videos/\" ng-class=\"{\'active\':ctr.section === \'videos\'}\">Видео</a>-->\n        <a href=\"/flow/?artist={{ctr.artistInfo.name}}\">Волна</a>\n        <a href=\"/artists/{{ctr.artistInfo.name}}/similar/\" ng-class=\"{\'active\':ctr.section === \'similar\'}\">Похожее</a>\n      </menu>\n\n      <span class=\"tags\">\n        <a class=\"tag\" href=\"/flow/?tag={{tag.name}}\" ng-repeat=\"tag in ctr.artistInfo.tags | limitTo:3\">\n          <i class=\"fa fa-tag\"></i>\n          <span>{{tag.name}}</span>\n        </a>\n      </span>\n\n      <a class=\"play\" href=\"/flow/?artist={{ctr.artistInfo.name}}\">\n        <i class=\"fa fa-play\"></i>\n        <span>Волна</span>\n      </a>\n      <div class=\"image\" ng-style=\"{\'background-image\':\'url(\'+ctr.artistInfo.image+\')\'}\"></div>\n    </div>\n  </header>\n\n\n  <section ng-if=\"!ctr.section\">\n    <div class=\"column\" ng-show=\"ctr.searchTracks.length\">\n      <div class=\"inner\">\n        <h2>Треки</h2>\n      </div>\n      <div class=\"albums list list-gray\">\n        <div ng-repeat=\"song in ctr.searchTracks\" track info=\"song\"></div>\n      </div>\n    </div>\n\n    <div class=\"column\" ng-show=\"ctr.publics.length\">\n      <div class=\"inner\">\n        <h2>Паблики <i class=\"fa fa-info-circle\" tooltip-html-unsafe=\"умное описание\" tooltip-trigger=\"mouseenter\"></i>\n        </h2>\n      </div>\n      <div class=\"publics\">\n        <a class=\"public\" href=\"/public/{{public.id}}/\" ng-repeat=\"public in ctr.publics\">\n          <div class=\"image\" ng-style=\"{\'background-image\':\'url(\'+public.photo_100+\')\'}\"></div>\n          <div class=\"info\">\n            <span class=\"name\" ng-bind=\"public.name\"></span>\n            <span class=\"members\">\n              <strong ng-bind=\"public.members_count\"></strong>&nbsp;подписчиков</span>\n          </div>\n        </a>\n      </div>\n    </div>\n\n    <div class=\"column\" ng-show=\"ctr.albums.length\">\n      <div class=\"inner\">\n        <h2>Альбомы</h2>\n      </div>\n      <div class=\"albums list list-gray clearfix\">\n        <div class=\"item\" album-image ng-repeat=\"item in ctr.albums\" info=\"item\"></div>\n      </div>\n    </div>\n  </section>\n\n  <section ng-if=\"ctr.section === \'tracks\'\">\n    <div class=\"column\">\n      <div class=\"inner\">\n        <h2>Треки</h2>\n      </div>\n      <div class=\"albums list list-gray\">\n        <div ng-repeat=\"song in ctr.searchTracks\" track info=\"song\"></div>\n      </div>\n    </div>\n  </section>\n\n  <section ng-if=\"ctr.section === \'albums\'\">\n    <div class=\"column\">\n      <div class=\"inner\">\n        <h2>Альбомы</h2>\n      </div>\n      <div class=\"albums list list-gray clearfix\">\n        <div class=\"item\" album-image ng-repeat=\"item in ctr.albums\" info=\"item\"></div>\n      </div>\n    </div>\n  </section>\n\n  <section ng-if=\"ctr.section === \'similar\'\">\n    <div class=\"column\">\n      <div class=\"inner\">\n        <h2>Тэги исполнителя</h2>\n        <section class=\"clearfix realTags\">\n          <a class=\"tag btn btn-primary white\" href=\"/flow/?tag={{tag.name}}\" ng-repeat=\"tag in ctr.artistInfo.tags | limitTo:15\">\n            <i class=\"fa fa-tag\"></i>\n            <span>{{tag.name}}</span>\n          </a>\n        </section>\n      </div>\n    </div>\n    <div class=\"column\">\n      <div class=\"inner\">\n        <h2>Похожие исполнители</h2>\n        <section class=\"list list-gray artistGrid clearfix\">\n          <a class=\"item\" href=\"/artists/{{item.name}}/\" ng-repeat=\"item in ctr.similarArtists | withoutStatsCleaning\">\n            <div class=\"image\" style=\"background-image: url({{item.imageSrc}})\"></div>\n            <footer>\n              <h3 ng-bind=\"item.name\"></h3>\n            </footer>\n          </a>\n        </section>\n      </div>\n    </div>\n  </section>\n\n</section>\n");
$templateCache.put("templates/views/discover/index.html","<section class=\"view view-fullsize view-padding\">\n  <section ng-if=\"ctr.searchMode\">\n    <h2>Результаты поиска для «{{ctr.query}}»</h2>\n    <section class=\"list list-gray artistGrid\">\n      <a class=\"item\" ng-repeat=\"item in ctr.artists\">\n        <div class=\"image\" style=\"background-image: url(../images/tmp/artist.jpg)\"></div>\n        <footer>\n          <h3 ng-bind=\"item.name\"></h3>\n          <span class=\"gray\">Сейчас её слушают\n            <span ng-bind=\"item.listeners\"></span>\n          </span>\n        </footer>\n      </a>\n    </section>\n  </section>\n\n  <section ng-if=\"!ctr.searchMode\">\n    <h2>Поиск музыки</h2>\n    <section class=\"list list-gray artistGrid\">\n      <a class=\"item\" ng-repeat=\"item in ctr.artists\">\n        <div class=\"image\" style=\"background-image: url(../images/tmp/artist.jpg)\"></div>\n        <footer>\n          <h3 ng-bind=\"item.name\"></h3>\n          <span class=\"gray\">Сейчас её слушают\n            <span ng-bind=\"item.listeners\"></span>\n          </span>\n        </footer>\n      </a>\n    </section>\n  </section>\n</section>\n");
$templateCache.put("templates/views/flow/index.html","<section id=\"view-flow\" class=\"view fullsizePlayingView\">\n  <div class=\"fullsizeImage\" set-bg-on-load=\"ctr.artistInfo.image\"></div>\n  <div class=\"container\">\n    <h2>Радио <a class=\"link no-border\" href=\"/artists/{{ctr.query}}/\" ng-if=\"!ctr.isTag\" ng-bind=\"ctr.query\"></a>\n      <span ng-if=\"ctr.isTag\" ng-bind=\"ctr.query\"></span>\n    </h2>\n\n    <div class=\"list ng-hide\">\n    	<div ng-repeat=\"song in ctr.songs\" track info=\"song\"></div>\n    </div>\n  </div>\n\n\n\n</section>\n");
$templateCache.put("templates/views/playlists/index.html","<section class=\"view view-fullsize view-padding column\">\n  <h2>Жанры и теги</h2>  \n  \n\n<a class=\"btn btn-default\" href=\"/flow/?tag={{genre.name}}\" ng-repeat=\"genre in ctr.genreList\" ng-bind=\"genre.name\"></a>\n\n</section>\n ");
$templateCache.put("templates/views/public/page.html","<section id=\"view_public\" class=\"view view-fullsize\">\n  <div class=\"column\">\n    <header class=\"whiteHeader\">\n      <div class=\"top\">\n        <h1>Паблик\n          <strong ng-bind=\"ctr.public.name\"></strong>\n          <span class=\"verified\" ng-if=\"ctr.public.verified\"><i class=\"fa fa-check\"></i> официальное сообщество</span>\n        </h1>\n        <h2 ng-if=\"ctr.parsedArtists\">\n          <span ng-if=\"ctr.parsedArtists.length > 1\">исполнителей</span>\n          <span ng-if=\"ctr.parsedArtists.length === 1\">исполнителя</span>\n          <a href=\"/artists/{{artist.name}}/\" ng-repeat=\"artist in ctr.parsedArtists\">{{artist.name}}</a>\n        </h2>\n        <div class=\"image\" ng-style=\"{\'background-image\':\'url(\'+ctr.public.photo_100+\')\'}\"></div>\n      </div>\n    </header>\n    <section class=\"description\" ng-bind-html=\"ctr.public.description | parseVkUrls\" ng-trim=\"true\"></section>\n  </div>\n\n  <div class=\"column\" ng-class=\"{\'short\':ctr.albums}\">\n  	<div class=\"albums\" ng-if=\"ctr.albums\">\n  		<a href=\"/public/{{ctr.public.id}}/\" class=\"album\" ng-class=\"{\'active\':!ctr.activeAlbum}\" ng-click=\"ctr.loadAlbum()\">Все треки</a>\n  		<a href=\"/public/{{ctr.public.id}}/?album_id={{album.id}}\" class=\"album\" ng-repeat=\"album in ctr.albums\"  ng-class=\"{\'active\':ctr.activeAlbum === album.id}\" ng-click=\"ctr.loadAlbum(album.id)\">{{album.title}}</a> \n  	</div>\n    <div class=\"inner\">\n      <h2>Треки</h2>\n    </div>\n    <div class=\"list list-gray\">\n      <div ng-repeat=\"song in ctr.songs\" track info=\"song\"></div>\n    </div>\n  </div>\n\n</section>\n");
$templateCache.put("templates/views/share/index.html","<section id=\"view_share\" class=\"view fullsizePlayingView\">\n  <div class=\"fullsizeImage\" set-bg-on-load=\"ctr.image\"></div>\n  <div class=\"container\" ng-if=\"!ctr.hideIntroButton\">\n    <h2>Playaaa</h2>\n    <span class=\"btn btn-primary singIn\" ng-click=\"ctr.auth()\">Войти через VK</span>\n  </div>\n\n\n\n</section>\n");}]);