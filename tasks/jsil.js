const eslint = require('gulp-eslint-new');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const touch = require('../lib/touch');
const terser = require('gulp-terser');

/**
 * Check and compress scripts to be inlined in HTML. This task
 * is different from `js` because it does not bundle dependencies.
 */
module.exports = function ({globs, base, dist}) {
    const main = function () {
        return gulp.src(globs, {base: base})
            .pipe(eslint())
            .pipe(gulpif(process.env.NODE_ENV === 'production', terser()))
            .pipe(gulp.dest(dist))
            .pipe(touch())
            ;
    };

    const watch = function () {
        return gulp.watch(globs, main);
    };

    main.displayName = 'jsil';
    watch.displayName = 'jsil:watch';

    return {main, watch};
};
