const changed = require('gulp-changed');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const path = require('path');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const touch = require('../lib/touch');

module.exports = function (config) {

    const compile = function () {
        switch (config.engine) {
            case 'dart':
                return require('gulp-exec')(
                    file => `/usr/bin/sass --silence-deprecation=mixed-decls "${file.path}"`,
                    {
                        continueOnError: false,
                        pipeStdout: true
                    }
                ).on('error', console.log);
            default:
                const sass = require('gulp-sass')(require('sass'));
                return sass({
                    outputStyle: 'expanded',
                    precision: 8,
                    silenceDeprecations: ['mixed-decls'],
                }, false).on('error', sass.logError);
        }
    };

    // todo replace with postcss plugin
    const cacheBustCssRefs = require('../lib/cachebust-css-refs').get(config);
    const splitPrint = require('../lib/postcss-split-print')({filter: config.print});

    const watchGlobs = [].concat(config.globs, config.watch || []);

    const globs = config.globs;
    globs.push('!**/_*.scss');

    function main() {
        return gulp.src(globs, {base: config.base})
            .pipe(changed(config.dist))
            .pipe(compile())
            .pipe(rename(function (path) {
                path.extname = path.extname.replace('scss', 'css');
            }))
            // these transforms are needed for cross-platform tests during development
            .pipe(postcss(config.transforms))
            .pipe(splitPrint())
            .pipe(gulpif(
                process.env.NODE_ENV === 'production',
                cacheBustCssRefs()
            ))
            .pipe(gulpif(
                function (file) {
                    // disable cssnano for some files
                    return process.env.NODE_ENV === 'production' &&
                        config.nooptims.indexOf(file.basename) === -1;
                },
                postcss(config.optimizations)
            ))
            .pipe(rename(function (path) {
                path.dirname = path.dirname.replace('scss', 'css');
            }))
            .pipe(gulp.dest(config.dist))
            .pipe(touch())
            ;
    }

    const watch = function () {
        return gulp.watch(watchGlobs, main);
    };

    main.displayName = 'scss';
    watch.displayName = 'scss:watch';

    return {main, watch};
};
