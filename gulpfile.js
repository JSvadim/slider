const gulp = require('gulp'),
      { watch, series } = require('gulp'),
      sass = require('gulp-sass')(require('sass'));

function scss() {
    return gulp.src('styles/**/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('app'));
} 

function watchFiles() {
    watch('styles/**/*.scss', series(scss));
}

exports.build = series(scss);
exports.watch = series(watchFiles);