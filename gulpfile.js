const gulp = require('gulp'),
      { watch, series, parallel, src, dest } = require('gulp'),
      autoprefix = require('gulp-autoprefixer'),
      rename = require('gulp-rename'),
      concat = require('gulp-concat'),
      del = require('del'),
      sass = require('gulp-sass')(require('sass')),
      woff = require('gulp-ttf2woff'),
      woff2 = require('gulp-ttf2woff2'),
      fonter = require('gulp-fonter'),
      fs = require('fs');

const APP_NAME = 'landing-page';
const LIBRARY_NAME = "galleryLib";


function landingStyles() {
    return src(`Source/${APP_NAME}/styles/style.scss`)
    .pipe(sass())
    .pipe(autoprefix())
    .pipe(dest(`${APP_NAME}/styles/`))
    .pipe(rename({suffix: '.min'}))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(dest(`${APP_NAME}/styles/`));
} 
function landingJS() {
    return src(`Source/${APP_NAME}/*.js`)
    .pipe(concat('index.js'))
    .pipe(dest(APP_NAME));
}
function landingHtml() {
    return src(`Source/${APP_NAME}/index.html`)
    .pipe(dest(`${APP_NAME}/`))
}
function landingImg() {
    del(`${APP_NAME}/img/**/*.*`);
    return src(`Source/${APP_NAME}/img/**/*.*`)
    .pipe(dest(`${APP_NAME}/img/`))
}


function libStyles() {
    return src(`Source/${LIBRARY_NAME}/${LIBRARY_NAME}.scss`)
    .pipe(sass())
    .pipe(autoprefix())
    .pipe(rename({basename: LIBRARY_NAME}))
    .pipe(dest(LIBRARY_NAME))
    .pipe(rename({suffix: '.min'}))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(dest(LIBRARY_NAME));
} 
function libJS() {
    return src(`Source/${LIBRARY_NAME}/**.js`)
    .pipe(dest(LIBRARY_NAME));
}



function moveReadyFonts() {
    return src([`Source/${APP_NAME}/fonts/*.woff`,`Source/${APP_NAME}/fonts/*.woff2`])
    .pipe(dest(`Source/${APP_NAME}/ready-fonts/`));
}
function fontsToWOFF() {
    return src(`Source/${APP_NAME}/fonts/*.ttf`)
    .pipe(woff())
    .pipe(dest(`Source/${APP_NAME}/ready-fonts/`))
}
function fontsToWOFF2() {
    return src(`Source/${APP_NAME}/fonts/*.ttf`)
    .pipe(woff2())
    .pipe(dest(`Source/${APP_NAME}/ready-fonts/`))
}
function landingFonts() {
    return src(`Source/${APP_NAME}/ready-fonts/*.*`)
    .pipe(dest(`${APP_NAME}/fonts/`))
}
// connect fonts with scss mixin
async function fontStyle(params) {
    fs.writeFile(`Source/${APP_NAME}/styles/fonts.scss`, '', cb);
    return fs.readdir(`Source/${APP_NAME}/fonts`, function (err, items) {
        if (items) {
            let currentFontname;
            for (let i = 0; i < items.length; i++) {
                let fontname = items[i].split('.');
                fontname = fontname[0];
                if (currentFontname != fontname) {
                    fs.appendFile(`Source/${APP_NAME}/styles/fonts.scss`, '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                }
                currentFontname = fontname;
            }
        }
        cb()
    })
}
function cb() {}

function watchFiles() {
    watch(`Source/${APP_NAME}/styles/*.scss`, series(landingStyles));
    watch(`Source/${APP_NAME}/*.js`, series(landingJS));
    watch(`Source/${APP_NAME}/index.html`, series(landingHtml));
    watch(`Source/${APP_NAME}/img/`, series(landingImg));
    watch(`Source/${APP_NAME}/fonts/`, series(clearReadyFontsFolder,
                                              moveReadyFonts, 
                                              fontsToWOFF, 
                                              fontsToWOFF2, 
                                              landingFonts,
                                              fontStyle,
                                              landingStyles));
    watch(`Source/${LIBRARY_NAME}/${LIBRARY_NAME}.js`, series(libJS));
    watch(`Source/${LIBRARY_NAME}/${LIBRARY_NAME}.scss`, series(libStyles));
}
function clear() {
    del(`Source/${APP_NAME}/ready-fonts`);
    del(LIBRARY_NAME);
    return del(APP_NAME)
}
function clearReadyFontsFolder() {
    return del(`Source/${APP_NAME}/ready-fonts`)
}

exports.buildLib = parallel(libStyles, libJS);
exports.buildLanding =
 series(
     parallel(
         landingJS,
         landingHtml,
         landingImg),
     moveReadyFonts, 
     fontsToWOFF, 
     fontsToWOFF2, 
     landingFonts,
     fontStyle,
     landingStyles);
exports.clear = series(clear);
exports.watch = series(watchFiles);