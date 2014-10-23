angular.module('App').directive('thiefBackground', [function() {
  return {
    scope: {
      imageUrl: '=thiefBackground'
    },
    link: function($scope, $element) {
      return;
      var id = 's' + Math.random().toString(36).substring(2);
      $element.append('<img src="' + $scope.imageUrl + '" id="' + id + '">');
      //$element.append('<img src="http://playaaa.dev/images/background/intro.jpg" id="' + id + '">');


 
      var sourceImage = document.getElementById(id);
      sourceImage.crossOrigin = "anonymous";
      var canvas = document.createElement("canvas");
      var w = canvas.width = $element.offsetWidth;
      var h = canvas.height = $element.offsetHeight;

      var context = canvas.getContext("2d");




      sourceImage.onload = function() {
        // Handler for .load() called.

        var colorThief = new ColorThief();
        var colorsLength = 5;
        var colors = colorThief.getPalette(sourceImage, colorsLength)

        for (i = 0; i < w; i++) {
          for (j = 0; j < h; j++) {
            var color = colors[Math.floor(Math.random() * colorsLength)]
            context.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
            context.fillRect(i, j, 1, 1);
          }
        }

        $element.css({
          "background": "url(" + canvas.toDataURL() + ")"
        });

      }



    }
  }
}])
