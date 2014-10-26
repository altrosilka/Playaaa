angular.module('App').filter('withoutStatsCleaning', [function() {
  return function(array) {
    if (!array) {
      return;
    }
    return _.reduce(array, function(result, item) {
      if (item.imageSrc.indexOf('KeepStatsClean') === -1) {
        result.push(item);
      }

      return result;
    }, []);
  }
}]);
