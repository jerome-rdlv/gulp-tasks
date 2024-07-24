const changed = require('gulp-changed');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const resize = require('gulp-image-resize');
const touch = require('../lib/touch');
const imageminOptions = require('../defaults/imagemin');

module.exports = function ({globs, base, dist}) {
    const main = function () {
        return gulp.src(globs, {
            base: base,
            encoding: false,
        })
            .pipe(changed(dist))
            .pipe(resize({
                quality: 0.85
            }))
            .pipe(imagemin(imageminOptions, {verbose: false}))
            .pipe(gulp.dest(dist)).pipe(touch());

    };

    const watch = function () {
        return gulp.watch(globs, main);
    };

    main.displayName = 'img';
    watch.displayName = 'img:watch';

    return {main, watch};
};
