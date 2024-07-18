const changed = require('gulp-changed');
const gulp = require('gulp');
const touch = require('../lib/touch');

module.exports = function ({globs, base, dist}) {

    function main() {
        return gulp.src(globs, {
            allowEmpty: true,
            base: base
        })
            .pipe(changed(dist))
            .pipe(gulp.dest(dist))
            .pipe(touch());
    }

    function watch() {
        return gulp.watch(globs, main);
    }

    main.displayName = 'copy';
    watch.displayName = 'copy:watch';

    return {main, watch};
};
