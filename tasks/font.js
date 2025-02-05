const changed = require('gulp-changed');
const fontsubset = require('../lib/font-subset');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const touch = require('../lib/touch');

module.exports = function ({globs, base, dist, subset}) {

    function main() {

        const prod = process.env.NODE_ENV === 'production';
        const text = prod && subset ? (typeof subset === 'function' ? subset.call() : subset) : '';

        return gulp.src(globs, {
            allowEmpty: true,
            base: base,
            encoding: false,
        })
            // .pipe(gulpif(!prod, changed(dist)))
            .pipe(gulpif(!!text.length, fontsubset(text)))
            // .pipe(changed(dist))
            .pipe(gulp.dest(dist))
            .pipe(touch());
    }

    function watch() {
        return gulp.watch(globs, main);
    }

    main.displayName = 'font';
    watch.displayName = 'font:watch';

    return {main, watch};
};
