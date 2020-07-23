var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var templatecache = require('gulp-angular-templatecache');

var paths = {
  sass: ['./scss/**/*.scss'],
  templatecache: ['./www/templates/**/*.html'],
};

gulp.task('default', ['sass', 'templatecache']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});
gulp.task('copyplugins', function() {
  gulp.src('./bower_components/ionic/fonts/*')
  .pipe(gulp.dest('./www/lib/ionic/fonts'))
  gulp.src('./bower_components/ionic/js/ionic.bundle.min.js')
  .pipe(gulp.dest('./www/lib/ionic'))   
  gulp.src('./bower_components/ngCordova/dist/ng-cordova.min.js')
  .pipe(gulp.dest('./www/lib'))
  gulp.src('./bower_components/ionic-datepicker/dist/ionic-datepicker.bundle.min.js')
  .pipe(gulp.dest('./www/lib'))
  gulp.src('./bower_components/ionic-timepicker/dist/ionic-timepicker.bundle.min.js')
  .pipe(gulp.dest('./www/lib'))
  gulp.src('./bower_components/angular-validation/dist/angular-validation.js')
  .pipe(gulp.dest('./www/lib'))
  gulp.src('./bower_components/angular-validation/dist/angular-validation-rule.js')
  .pipe(gulp.dest('./www/lib'))
  gulp.src('./bower_components/angular-loading-bar/build/loading-bar.min.js')
  .pipe(gulp.dest('./www/lib'))
  gulp.src('./bower_components/angular-bcrypt/dist/dtrw.bcrypt.js')
  .pipe(gulp.dest('./www/lib'))
  gulp.src('./bower_components/ion-floating-menu/dist/ion-floating-menu.js')
  .pipe(gulp.dest('./www/lib'))
});


gulp.task('templatecache', function (done) {
  gulp.src(paths.templatecache)
    .pipe(templatecache({standalone:true, filename:'views.js', module:'scms_attendance.views', root:'templates/'}))
    .pipe(gulp.dest('./www/js/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.templatecache, ['templatecache']);
});



gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
