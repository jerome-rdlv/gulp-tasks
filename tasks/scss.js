const changed = require('gulp-changed');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const touch = require('../lib/touch');
const sourcemaps = require('gulp-sourcemaps');

function renameFile(file) {
    file.extname = file.extname.replace('scss', 'css');
    file.dirname = file.dirname.replace('scss', 'css');
}

module.exports = function (config) {

    function compile() {
        switch (config.engine) {
            case 'dart':
                return require('../transforms/sass-dart')();
            default:
                return require('../transforms/sass-js')();
        }
    }

    function plugins(file) {
        const clone = file.clone({deep: false, contents: false});
        renameFile(clone);
        return {
            plugins: [
                ...config.transforms,
                ...(
                    process.env.NODE_ENV === 'production' && (!config.optimize || config.optimize(file))
                        ? config.optimizations
                        : []
                )
            ],
            options: {
                // from: file.path,
                to: clone.path,
            }
        };
    }

    const watchGlobs = [].concat(config.globs, config.watch || []);

    const globs = config.globs;
    globs.push('!**/_*.scss');

    function main() {
        let task = gulp.src(globs, {base: config.base})
            .pipe(changed(config.dist))
            .pipe(sourcemaps.init())
            .pipe(compile())
            .pipe(postcss(plugins))
            .pipe(rename(renameFile));

        (config.splits || []).forEach(split => task = task.pipe(split));

        task = task.pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(config.dist))
            .pipe(touch());

        return task;
    }

    const watch = function () {
        return gulp.watch(watchGlobs, main);
    };

    main.displayName = 'scss';
    watch.displayName = 'scss:watch';

    return {main, watch};
};
