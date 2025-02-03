const changed = require('gulp-changed');
const gulp = require('gulp');
const gulpif = require('gulp-if');
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
            plugins: Object.values({
                ...config.transforms,
                ...(
                    process.env.NODE_ENV === 'production' && config.nooptims.indexOf(file.basename) === -1
                        ? config.optimizations
                        : {}
                )
            })
        };
    }

    // todo replace with postcss plugin
    const cacheBustCssRefs = require('../lib/cachebust-css-refs').get(config);

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
            // todo Move to postcss plugin
            .pipe(gulpif(
                process.env.NODE_ENV === 'production',
                cacheBustCssRefs()
            ))
            .pipe(splitPrintScreen())
            .pipe(splitMobileDesktop())
            .pipe(rename(path => path.dirname = path.dirname.replace('scss', 'css')))
            .pipe(sourcemaps.write('.'))
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
