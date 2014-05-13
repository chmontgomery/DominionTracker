var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  clean = require('gulp-clean'),
  less = require('gulp-less'),
  livereload = require('gulp-livereload'),
  concat = require('gulp-concat'),
  gutil = require('gulp-util'),
  publicFiles = [
    './bower_components/angular/angular.js',
    './bower_components/angular-route/angular-route.js',
    './bower_components/angular-animate/angular-animate.js',
    './bower_components/angular-sanitize/angular-sanitize.js',
    './bower_components/angular-strap/dist/angular-strap.js',
    './bower_components/angular-strap/dist/angular-strap.tpl.js',
    './bower_components/jquery/dist/jquery.js',
    './bower_components/bootstrap/dist/css/bootstrap.css',
    './bower_components/bootstrap/dist/css/bootstrap.css.map',
    './bower_components/bootstrap/dist/css/bootstrap-theme.css',
    './bower_components/bootstrap/dist/css/bootstrap-theme.css.map',
    './bower_components/angular-motion/dist/angular-motion.css',
    './bower_components/bootstrap/dist/js/bootstrap.js',
    './bower_components/bootstrap/dist/fonts/*',
    './bower_components/bootstrap-additions/dist/bootstrap-additions.css',
    './bower_components/moment/moment.js',
    './bower_components/lodash/dist/lodash.js'
  ],
  resourceFiles = [
    './src/client/**/*.{png,html,ico}'
  ],
  dist = './dist/public';

require('load-common-gulp-tasks')(gulp, {
  paths: {
    lint: [
      './*.js',
      './src/controllers/**/*.js',
      './src/lib/**/*.js',
      './test/**/*.js'
    ],
    felint: [
      './src/client/**/*.js'
    ],
    cover: [
      './src/controllers/**/*.js',
      './src/lib/**/*.js',
      './server.js'
    ],
    test: [
      './test/**/*.js'
    ]
  },
  jshintrc: {
    server: '.jshintrc',
    client: 'client.jshintrc'
  }
});

// redefine since instanbul doesn't support ES6
gulp.task('ci', 'Lint, tests and test coverage', ['lint', 'felint', 'test']);
gulp.task('ci-watch', false, ['lint-watch', 'felint-watch', 'test-watch']);

gulp.task('develop', 'Watch and restart server on change', ['build', 'watch'], function () {
  nodemon({
    script: 'server.js',
    ext: 'html js',
    ignore: [],
    execMap: {
      js: "node --harmony"
    }
  })
    .on('change', ['ci-watch'])
    .on('restart', function () {
      var d = new Date();
      console.log(gutil.colors.bgBlue('server restarted at ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()));
    });
});

gulp.task('clean', function () {
  return gulp.src(['./dist/*'], {read: false})
    .pipe(clean());
});

gulp.task('bower-files', false, function () {
  // the base option sets the relative root for the set of files,
  // preserving the folder structure
  return gulp.src(publicFiles, { base: './bower_components/' })
    .pipe(gulp.dest(dist));
});

gulp.task('content-files', false, function () {
  return gulp.src(resourceFiles)
    .pipe(gulp.dest(dist));
});

gulp.task('content-js', false, function () {
  return gulp.src('./src/client/**/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest(dist + '/scripts'));
});

gulp.task('styles', function () {
  return gulp.src('./src/client/**/*.less')
    .pipe(less())
    .pipe(concat('all.css'))
    .pipe(gulp.dest(dist + '/styles'));
});

gulp.task('watch', function () {
  var server = livereload();
  return gulp.watch(['./src/client/**/*.*'], ['build']).on('change', function (file) {
    server.changed(file.path);
  });
});

gulp.task('public', false, ['content-files', 'content-js', 'bower-files', 'styles']);
gulp.task('build', 'Builds all static files', ['public']);