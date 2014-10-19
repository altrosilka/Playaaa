angular.module('App')
  .filter('toGIS', function() {
    return function(input) {
      if (!input) {
        return '';
      }
      var ss = "",
        mm = '';
      var mss = input;
      mss = Math.round(mss);
      sec = mss % 60;
      min = Math.floor(mss / 60);
      if (sec < 10)
        ss = "0";
      if (min < 10)
        mm = "0";
      return mm + min + ":" + ss + sec;
    };
  })
  .filter('formatBitrate', function() {
    return function(br) {
      var q = '';
      if (br < 128)
        q = '< 128';
      if (br >= 128 && br < 180)
        q = '128';
      if (br >= 180 && br < 240)
        q = '192';
      if (br >= 240 && br < 300)
        q = '256';
      if (br >= 300)
        q = '320';
      return q + ' кбит/с';
    };
  });
