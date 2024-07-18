const gulp = require('gulp');
const clean = require('gulp-clean');

/**
 * @param globs Array of paths to delete. May contain exclusions prefixed by an exclamation mark
 * @param config
 * @returns {function(): *}
 */
module.exports = function (globs, config = {}) {
    function main() {
        return gulp.src(globs, {
            ...{
                allowEmpty: true,
                dot: true,
                read: false
            },
            ...config
        }).pipe(clean());
    }

    main.displayName = 'clean';
    return main;
};
