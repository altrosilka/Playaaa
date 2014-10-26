var gulp = require("gulp"),
  http = require("http"),
  concat = require('gulp-concat'),
  minifyCSS = require("gulp-minify-css"),
  fs = require('fs'),
  semver = require('semver'),
  uglify = require('gulp-uglify'),
  replace = require('gulp-replace-task'),
  bump = require('gulp-bump'),
  git = require('gulp-git'),
  less = require('gulp-less'),
  templateCache = require('gulp-angular-templatecache');
 
var vendorLibs = [
  './bower_components/jquery/dist/jquery.js',
  './bower_components/lodash/dist/lodash.js',
  './bower_components/bootstrap/dist/js/bootstrap.js',
  './bower_components/angular/angular.js',
  './bower_components/angular-ui-router/release/angular-ui-router.js',
  './bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
  './bower_components/momentjs/moment.js'
  //'./bower_components/color-thief/src/color-thief.js'
];


gulp.task('scripts', function() {
  gulp.src(['./src/js/**/*.js'])
    .pipe(concat('scripts.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('./public/pack'))
  gulp.src(vendorLibs)
    .pipe(concat('vendor.js'))
    // .pipe(uglify())
    .pipe(gulp.dest('./public/pack'))
});


gulp.task('scripts-deploy', function() {
  gulp.src(['./src/js/**/*.js'])
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/pack'))
  gulp.src(vendorLibs)
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/pack'))
});

gulp.task('less', function() {
  gulp.src('./src/less/styles.less')
    .pipe(less())
    .pipe(gulp.dest('./public/pack'));
});

gulp.task('vendors-styles', function() {
  gulp.src([
      './bower_components/bootstrap/dist/css/bootstrap.min.css',
      './bower_components/font-awesome/css/font-awesome.css'
    ])
    .pipe(minifyCSS({
      keepBreaks: true
    }))
    .pipe(concat('vendors.css'))
    .pipe(gulp.dest('./public/pack'))
});

gulp.task('templates', function() {
  gulp.src('./src/templates/**/*.html')
    .pipe(templateCache('templates.js', {
      standalone: true,
      root: './templates/'
    }))
    .pipe(gulp.dest('./public/pack'));
});

gulp.task("watch", function() {
  gulp.watch('./src/js/**', ["scripts"]);
  gulp.watch('./src/less/**', ["less"]);
  gulp.watch('./tmp/css/**', ["styles"]);
  gulp.watch('./src/templates/**', ["templates"]);
  gulp.watch('./src/**/*.html', ["create-index"]);
});

gulp.task('create-index', function() {
  var pkg = getPackageJson();
  var version = pkg.version;

  gulp.src('./src/index.html')
    .pipe(replace({
      patterns: [{
        match: 'version',
        replacement: version
      }, {
        match: 'baseUrl',
        replacement: '/'
      }]
    }))
    .pipe(gulp.dest('./public'));
});

gulp.task('build', [
    'less',
    'vendors-styles',
    'templates',
    'scripts-deploy',
    'create-index'
  ],
  function() {

  });


/* VERSION */
var getPackageJson = function() {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
};

function inc(type) {
  var pkg = getPackageJson();
  var newVer = semver.inc(pkg.version, type);


  git.tag('v' + newVer, 'new version', function(err) {
    console.log(newVer)
  });


  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({
      version: newVer
    }))
    .pipe(gulp.dest('./'));


}

gulp.task('patch', function() {
  inc('patch');
  gulp.run('create-index');
});
gulp.task('feature', function() {
  inc('minor');
  gulp.run('create-index');
});
gulp.task('release', function() {
  inc('major');
  gulp.run('create-index');
});
