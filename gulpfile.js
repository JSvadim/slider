const gulp = require('gulp'),
      { watch, series } = require('gulp'),
      autoprefix = require('gulp-autoprefixer'),
      rename = require('gulp-rename'),
      sass = require('gulp-sass')(require('sass'));

const APP_NAME = 'landing-presentation';
const LIBRARY_FOLDER_NAME = "galleryLib";
const LIBRARY_STYLES_NAME = "galleryLib";


function scssForAppStyles() {
    return gulp.src('styles/**/style.scss')
    .pipe(sass())
    .pipe(autoprefix())
    .pipe(gulp.dest(`${APP_NAME}/styles/`))
    .pipe(rename({suffix: '.min'}))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulp.dest(`${APP_NAME}/styles/`));
} 
function scssForLibStyles() {
    return gulp.src('styles/**/galleryLib.scss')
    .pipe(sass())
    .pipe(autoprefix())
    .pipe(rename({basename: LIBRARY_STYLES_NAME}))
    .pipe(gulp.dest(LIBRARY_FOLDER_NAME))
    .pipe(rename({suffix: '.min'}))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulp.dest(LIBRARY_FOLDER_NAME));
} 


function watchFiles() {
    watch(['styles/**/*.scss', '!styles/galleryLib.scss'], series(scssForAppStyles));
    watch('styles/galleryLib.scss', series(scssForLibStyles));
}

exports.build = series(scssForAppStyles, scssForLibStyles);
exports.watch = series(watchFiles);