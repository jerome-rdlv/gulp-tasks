const changed = require('gulp-changed');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const touch = require('../lib/touch');
const sourcemaps = require('gulp-sourcemaps');

module.exports = function (config) {

    function compile() {
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
    }

    function plugins(file) {
        return {
            plugins: [
                ...config.transforms,
                ...(
                    process.env.NODE_ENV === 'production' && config.nooptims.indexOf(file.basename) === -1
                        ? config.optimizations
                        : []
                )
            ],
            options: {
                to: file.path.replace(config.base, config.dist),
            }
        };
    }

    const splitPrintScreen = require('../lib/css-split-print-screen')(config.splits.print);
    const splitMobileDesktop = require('../lib/css-split-mobile-desktop')(config.splits.desktop);

    const watchGlobs = [].concat(config.globs, config.watch || []);

    const globs = config.globs;
    globs.push('!**/_*.scss');

    function main() {
        return gulp.src(globs, {base: config.base})
            .pipe(changed(config.dist))
            .pipe(sourcemaps.init())
            .pipe(compile())
            .pipe(rename(path => path.extname = path.extname.replace('scss', 'css')))
            .pipe(postcss(plugins))
            .pipe(splitPrintScreen())
            .pipe(splitMobileDesktop())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(config.dist))
            .pipe(touch());
    }

    const watch = function () {
        return gulp.watch(watchGlobs, main);
    };

    main.displayName = 'scss';
    watch.displayName = 'scss:watch';

    return {main, watch};
};
