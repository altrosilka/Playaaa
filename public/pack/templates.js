angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("templates/modals/vkCaptcha.html","<div class=\"modal-header\">\n  <h3 class=\"modal-title\">Реши капчу</h3>\n</div>\n<div class=\"modal-body\">\n  Для продолжения работы нужно ввести код с картинки:\n  <img ng-src=\"{{imageUrl}}\" /> \n  <input autofocus type=\"text\" ng-model=\"code\">\n</div>\n<div class=\"modal-footer\">\n  <button class=\"btn btn-primary\" ng-click=\"$close(code)\">OK</button>\n  <button class=\"btn btn-link pull-left\" ng-click=\"$dismiss()\">Отменить</button>\n</div>\n");
$templateCache.put("templates/directives/albumImage.html","<a href=\"/#!/album/{{info.mbid}}\" class=\"albumImage\">\n  <div class=\"img\" style=\"background-image:url({{info.albumImage}})\"></div>\n  <div class=\"overlay\">\n    <span class=\"title\">{{info.artist.name}} - {{info.name}}</span>\n  </div>\n</div>  ");
$templateCache.put("templates/directives/minutesScaler.html","<div></div>");
$templateCache.put("templates/directives/track.html","<div class=\"track\" ng-class=\"{\'error\': error, \'playing\': $root.currentTrack.id==info.id}\">\n  <button class=\"play btn btn-default\">\n   	<i class=\"fa fa-play\"></i>\n  </button>\n  <span class=\"time\">{{info.duration | toGIS}}</span>\n  <span class=\"bitrate\" ng-show=\"bitrate\">{{bitrate | formatBitrate}}</span>\n  <span class=\"text\">\n    <span class=\"artist\">{{info.artist}}</span>\n    –\n    <span class=\"title\">{{info.title}}</span>\n  </span>\n</div>\n");
$templateCache.put("templates/views/discover/index.html","<section class=\"view view-fullsize view-padding\">\n  <h2>Популярные исполнители</h2> \n  <section class=\"list list-gray artistGrid\">\n    <a class=\"item\" ng-repeat=\"item in ctr.artists\">\n      <div class=\"image\" style=\"background-image: url(../images/tmp/artist.jpg)\"></div>\n      <footer>\n        <h3 ng-bind=\"item.name\"></h3>\n        <span class=\"gray\">Сейчас её слушают\n          <span ng-bind=\"item.listeners\"></span>\n        </span>\n      </footer>\n    </a>\n  </section>\n</section>\n");
$templateCache.put("templates/views/artists/index.html","<section class=\"view view-fullsize view-padding\">\n  <h2>Популярные исполнители</h2>  \n  <section class=\"list list-gray artistGrid\">\n    <a class=\"item\" href=\"/artists/{{item.name}}\" ng-repeat=\"item in ctr.artists\">\n      <div class=\"image\" style=\"background-image: url(../images/tmp/artist.jpg)\"></div>\n      <footer>\n        <h3 ng-bind=\"item.name\"></h3>\n        <span class=\"gray\">Сейчас её слушают\n          <span ng-bind=\"item.listeners\"></span>\n        </span>\n      </footer>\n    </a>\n  </section>\n</section>\n ");
$templateCache.put("templates/views/artists/page.html","<section id=\"view-artists-page\" class=\"view view-fullsize\">\n  <header>\n    <div class=\"fullsizeImage\" ng-style=\"{\'background-image\':\'url(\'+ctr.artistInfo.image+\')\'}\"></div>\n    <div class=\"top\">\n      <h1 ng-bind=\"ctr.artistInfo.name\"></h1>\n    </div>\n  </header>\n\n  <a href=\"/flow/?artist={{ctr.artistInfo.name}}\">Flow</a>\n\n  <div ng-show=\"ctr.albums.length\">\n    <div class=\"inner\">\n      <h2>Альбомы</h2>\n    </div>\n    <div class=\"albums list list-gray\">\n      <div class=\"item\" album-image ng-repeat=\"item in ctr.albums\" info=\"item\"></div>\n    </div>\n  </div>\n</section>\n");
$templateCache.put("templates/views/flow/index.html","<section class=\"view view-fullsize view-padding\">\n  <h2>Радио по {{ctr.type}} «{{ctr.query}}»</h2>  \n  \n\n<div ng-repeat=\"song in ctr.songs\" track info=\"song\"></div>\n\n</section>\n ");}]);