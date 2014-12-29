var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  argv = require('yargs').argv,
  del = require('del'),
  less = require('gulp-less'),
  concat = require('gulp-concat'),
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
    './src/client/**/*.{png,html,ico,svg,ttf,woff}'
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

// do a clean and build when first starting up
gulp.task('dev', 'Watch and restart server on change', function (cb) {
  require('run-sequence')('build',
    ['nodemon', 'watch'],
    cb);
}, {
  options: {
    'debug': 'Start in debug mode'
  },
  aliases: ['develop']
});

gulp.task('nodemon', false, function (cb) {
  var nodemon = require('gulp-nodemon');

  var nodemonOpts = {
    script: 'server.js',
    ext: 'html js',
    ignore: [ // only watch server files
      './bower_components/**',
      './node_modules/**',
      './dist/**',
      './src/client/**'
    ],
    nodeArgs: ['--harmony']
  };
  if (argv.debug) {
    nodemonOpts.nodeArgs.push('--debug');
  }
  nodemon(nodemonOpts)
    .on('restart', function () {
      var d = new Date();
      console.log(require('gulp-util').colors.bgBlue('server restarted at ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()));
    });
  cb();
});

gulp.task('clean', function (cb) {
  del(['./dist/**'], cb);
});

gulp.task('bower-files', false, function () {
  // the base option sets the relative root for the set of files,
  // preserving the folder structure
  return gulp.src(publicFiles, {base: './bower_components/'})
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
  var livereload = require('gulp-livereload');
  var livereloadServer = livereload();
  livereload.listen();
  return gulp.watch(['./src/client/**/*.*'], ['build']).on('change', function (file) {
    livereloadServer.changed(file.path);
  });
});

gulp.task('public', false, ['content-files', 'content-js', 'bower-files', 'styles']);
gulp.task('build', 'Builds all static files', ['public']);