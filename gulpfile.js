const gulp = require('gulp'),
      { watch, series } = require('gulp'),
      autoprefix = require('gulp-autoprefixer'),
      rename = require('gulp-rename'),
      sass = require('gulp-sass')(require('sass'));

function scss() {
    return gulp.src('styles/**/style.scss')
    .pipe(sass())
    .pipe(autoprefix())
    .pipe(gulp.dest('app'))
    .pipe(rename({suffix: '.min'}))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulp.dest('app'));
} 

function watchFiles() {
    watch('styles/**/*.scss', series(scss));
}

exports.build = series(scss);
exports.watch = series(watchFiles);