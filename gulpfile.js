"use strict";

var gulp = require('gulp'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
rename = require('gulp-rename'),
sass = require('gulp-sass'),
maps = require('gulp-sourcemaps'),
del = require('del'),
mocha = require('gulp-mocha'),
ngAnnotate = require('gulp-ng-annotate');

gulp.task("concatScripts", function() {
    return gulp.src([
        'src/js/app.js',
        'src/js/*.js',
        'src/js/**/*.js'
        ])
    .pipe(maps.init())
    .pipe(concat('app.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('minifyScripts', ['concatScripts'], function() {
  return gulp.src("public/js/app.js")
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('compileSass', function() {
  return gulp.src("src/styles/main.scss")
      .pipe(maps.init())
      .pipe(sass())
      .pipe(maps.write('./'))
      .pipe(gulp.dest('public/styles'));
});

gulp.task('transferViews', function() {
  return gulp.src("src/views/*.html")
      .pipe(gulp.dest('public/views'));
});

gulp.task('copyIndex', function() {
  return gulp.src("src/index.html")
      .pipe(gulp.dest('public'));
});

gulp.task('test', function() {
  return gulp.src('./test/**/*.js', {read: false})
      .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('watchFiles', function() {
  gulp.watch(['src/styles/**/*.scss', 'src/styles/*.scss'], ['compileSass']);
  gulp.watch(['src/js/*.js', 'src/js/**/*.js'], ['concatScripts']);
  gulp.watch(['src/index.html'], ['copyIndex']);
  gulp.watch(['src/views/**/*.html'], ['transferViews']);
});

gulp.task('watchTests', function() {
  gulp.watch(['test/**/*.js'], ['test']);
});

gulp.task('serve', ['watchFiles']);

gulp.task('clean', function() {
  del(['public/js', 'public/styles']);
});

gulp.task("build", [
    'clean',
    'minifyScripts', 
    'compileSass'
    ], function() {
      return gulp.src(["styles/main.css", "js/app.min.js"], { base: './'})
            .pipe(gulp.dest('public'));
});

gulp.task("default", ["serve"]);
