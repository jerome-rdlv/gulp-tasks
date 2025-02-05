const changed = require('gulp-changed');
const fontsubset = require('../lib/font-subset');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const touch = require('../lib/touch');

module.exports = function ({globs, base, dist, subset}) {

    function main() {

        const prod = process.env.NODE_ENV === 'production';

        return gulp.src(globs, {
            allowEmpty: true,
            base: base,
            encoding: false,
        })
            .pipe(gulpif(!prod, changed(dist)))
            .pipe(gulpif(prod, fontsubset(subset)))
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
