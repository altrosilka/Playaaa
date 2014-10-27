angular.module('App').filter('parseVkUrls', [function() {
  return function(input, removeLink) {
    if (!input) {
      return; 
    } 
 
    var regClub = /\[club([0-9]*)\|([^\]]*)\]/g;
    var regId = /\[id([0-9]*)\|([^\]]*)\]/g;

    var text = (removeLink) ? input.replace(regClub, '<span>$2</span>') : input.replace(regClub, '<a class="link" href="/public/$1/">$2</a>');
    text = text.replace(regId, '<span>$2</span>').replace(/\n/g, "<br />");

    return text;
  }
}]);
