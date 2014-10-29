angular.module('App').filter('unEscape', [function() {
  return function(text) {
    if (!text) {
      return; 
    } 

    return _.unescape(text);
  }
}]);
