const gulp = require('gulp');

module.exports = function (paths) {
    function main() {
        console.log(process.cwd(), paths.dist);
        return gulp
            .src(
                [
                    `${paths.var}/*`,
                    `${paths.dist}/*`,
                ],
                {
                    allowEmpty: true,
                    dot: true,
                    read: false
                }
            )
            .pipe(require('gulp-sort')())
            .pipe(require('gulp-clean')());
    }

    main.displayName = 'clean';
    return main;
};
