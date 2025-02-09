const changed = require('gulp-changed');
const cleanSvg = require('../lib/clean-svg');
const clearSvgParams = require('../lib/clear-svg-params');
const crypto = require('crypto');
const fs = require('fs');
const gulp = require('gulp');
const path = require('path');
const rename = require('gulp-rename');
const svgo = require('../lib/svgo');
const svgToScss = require('../lib/svg-to-scss');
const svgToSymbol = require('../lib/svg-to-symbol')();
const touch = require('../lib/touch');

function getFileSvgminConfig(file) {
    const dom = new (require('jsdom').JSDOM)(file.contents.toString(), {
        contentType: 'image/svg+xml',
    });
    const opts = dom.window.document.getElementById('svgo-options')?.innerHTML.trim();
    return opts ? JSON.parse(opts) : [];
}

function svgoConfigCallback(file) {
    const prefix = 'i' + crypto.createHash('sha1')
        .update(path.basename(file.relative, path.extname(file.relative)))
        .digest('hex')
        .substring(0, 4);

    /*
    Configuration can be disabled in svg files
    with following script:
    
        <script type="application/json" id="svgo-options">
            [
            "removeHiddenElems",
            "convertPathData",
            ]
        </script>
     */
    const defaults = {...require('../defaults/svgo')};
    const disabled = getFileSvgminConfig(file);

    defaults.path = file.path;
    defaults.plugins = defaults.plugins.filter(plugin => {
        return disabled.indexOf(plugin.name) === -1;
    });

    return defaults;
}

module.exports = function (config) {

    const cacheBustSvgRefs = require('../lib/cachebust-svg-refs').get(config);

    const main = function () {
        return gulp.src(config.globs, {base: config.base})
            .pipe(changed(config.var))
            .pipe(cacheBustSvgRefs())
            .pipe(svgo(svgoConfigCallback))
            .pipe(cleanSvg())
            .pipe(touch())
            .pipe(gulp.dest(config.var))
            .pipe(clearSvgParams())
            .pipe(gulp.dest(config.dist))
        ;
    };

    main.displayName = 'svg';

    // svg availability in SCSS
    const scss = function () {

        // look for template
        let tpl = config.base + '/svg.scss.mustache';
        if (!fs.existsSync(tpl)) {
            tpl = __dirname + '/../svg.scss.mustache';
        }

        return gulp.src(config.var + '/svg/**/*.svg', {base: config.var + '/svg'})
            .pipe(svgToScss({
                template: tpl,
                output: '_svg.scss'
            }))
            .pipe(touch())
            .pipe(gulp.dest(config.var))
            ;
    };

    scss.displayName = 'svg:scss';

    // svg availability for inclusion as inline symbol in html
    const symbol = function () {
        return gulp.src(config.var + '/svg/**/*.svg', {base: config.var})
            .pipe(changed(config.dist, {extension: '.symbol.svg'}))
            .pipe(svgToSymbol())
            .pipe(clearSvgParams())
            .pipe(rename(function (path) {
                path.extname = '.symbol.svg';
            }))
            .pipe(touch())
            .pipe(gulp.dest(config.dist))
            ;
    };

    symbol.displayName = 'svg:symbol';

    const watch = function () {
        // prepare svg, create symbols and update scss lib
        return gulp.watch(
            config.globs.concat([`${config.base}/svg.scss.mustache`]),
            gulp.series(main, gulp.parallel(scss, symbol)));
    };

    watch.displayName = 'svg:watch';

    return {
        main,
        watch,
        scss,
        symbol,
    };
};
