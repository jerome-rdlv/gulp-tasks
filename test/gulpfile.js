/**
 * Some options can be overridden by CLI arguments:
 *  - --url=http://example.org
 *  - --production or --prod
 */
const changed = require('gulp-changed');
const rename = require('gulp-rename');
const touch = require('../lib/touch');
const {series, parallel} = require('gulp');
const yargs = require('yargs');
const {hideBin} = require('yargs/helpers');
const browserSync = require('browser-sync');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');

const paths = {
    src: `${__dirname}/src`,
    dist: `${__dirname}/dist`,
    var: `${__dirname}/var`,
};

const argv = yargs(hideBin(process.argv)).parse();

const clean = require('../tasks/clean')([
    `${paths.var}/*`,
    `${paths.dist}/*`,
    `!${paths.dist}/report.html`,
]);

const critical = require('../tasks/critical')({
    dist: `${paths.dist}/css/critical`,
    entries: [
        {name: 'front-page.php', url: argv['url']},
    ],
});

const img = require('../tasks/img')({
    globs: `${paths.src}/img/**/*.+(gif|jpg|jpeg|png)`,
    base: paths.src,
    dist: paths.dist
});

const browsersync = function () {
    return new Promise(function (resolve) {
        // noinspection JSUnusedGlobalSymbols
        browserSync.create('rdlv.www').init({
            // see https://browsersync.io/docs/options
            server: paths.dist,
            watch: true,
            open: false,
            ghostMode: false,
            ui: false,
            host: argv['host'] || null,
            https: {
                key: process.env.RDLV_DEV_KEY,
                cert: process.env.RDLV_DEV_CERT,
            },
            middleware: function (req, res, next) {
                req.url = req.url.replace(/^(.+)\.v([0-9a-z]+)\.([a-z0-9]+)(\?.*)?$/, '$1.$3');
                return next();
            },
        }, resolve);
    });
}
browsersync.displayName = 'browsersync';

const js = require('../tasks/js')({
    globs: [
        `${paths.src}/js/main.js`,
    ],
    base: paths.src,
    dist: paths.dist
});

const jsil = require('../tasks/jsil')({
    globs: [`${paths.src}/js/inline/*.js`],
    base: paths.src,
    dist: paths.dist
});

const copy = require('../tasks/copy')({
    globs: [
        // `${paths.base}/font/*.{woff,woff2}`
        `${paths.src}/*.html`
    ],
    base: paths.src,
    dist: paths.dist
});

const font = require('../tasks/font')({
    globs: [`${paths.src}/font/*.{woff,woff2}`],
    // globs: [`${paths.base}/font/droid*.woff2`],
    base: paths.src,
    dist: paths.dist,
    subset: file => {
        const text = require(`${paths.var}/stats.json`).text;
        return text[file.stem] || text.all;
    },
});

const factory = require('../lib/factory');
const cachebustUrl = factory(() => require('../lib/cachebust-url')());
const getFileSignature = factory(() => require('../lib/get-file-signature')());

const scss = (() => {
    function main(done) {

        const scssToCss = require('../lib/scss-to-css');

        const plugins = [
            require('postcss-pxtorem')(require('../defaults/pxtorem')),
            require('postcss-preset-env'),
            require('../postcss/font-fallback')({
                'droid': ['Georgia', 'Times New Roman', 'Noto Serif'],
                'bitter': 'serif',
            }),
        ];

        if (process.env.NODE_ENV === 'production') {
            // noinspection JSCheckFunctionSignatures
            plugins.push(...[
                require('../postcss/cachebust')(cachebustUrl(), getFileSignature()),
                require('cssnano'),
            ]);
        }

        return gulp.src([`${paths.src}/scss/**/*.scss`], {base: paths.src})
            .pipe(changed(paths.dist))
            .pipe(sourcemaps.init())
            .pipe(require('../transforms/sass-dart')())
            .pipe(postcss(require('../lib/postcss-config')(plugins, scssToCss)))
            .on('error', done)
            .pipe(rename(scssToCss))
            .pipe(require('../lib/css-font-metadata')(`../var/fonts.json`))
            .pipe(require('../lib/css-split-print-screen')(file => file.basename === 'main.css'))
            .pipe(require('../lib/css-split-fonts')({
                remove: false,
                filter: file => file.basename === 'main.css'
            }))
            .pipe(require('../lib/css-split-mobile-desktop')({
                // Lighthouse Moto G Power test device screen is 412px wide (26em × 16px)
                breakpoint: 26,
                filter: file => file.basename === 'main.css',
            }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(paths.dist))
            .pipe(touch());
    }

    main.displayName = 'scss';

    function watch() {
        return gulp.watch([
            `${paths.src}/scss/**/*.scss`,
            `${paths.var}/_svg.scss`,
        ], main);
    }

    watch.displayName = 'scss:watch';

    return {main, watch};
})();

// const scss = require('../tasks/scss')({
//     base: paths.src,
//     dist: paths.dist,
//     ...require('../defaults/scss'),
//     ...{
//         // print: /main\.css$/,
//         optimize: file => file.basename !== 'editor.css',
//         globs: [
//             `${paths.src}/scss/**/*.scss`,
//         ],
//         watch: [
//             `${paths.var}/_svg.scss`,
//             path.resolve(paths.src + '/../blocks') + '/**/*.scss',
//         ],
//     },
//     splits: [
//         require('../lib/css-font-metadata')(`fonts.json`),
//         require('../lib/css-split-print-screen')(file => file.basename === 'main.css'),
//         require('../lib/css-split-fonts')({
//             remove: false,
//             filter: file => file.basename === 'main.css'
//         }),
//         require('../lib/css-split-mobile-desktop')({
//             // Lighthouse Moto G Power test device screen is 412px wide (26em × 16px)
//             breakpoint: 26,
//             filter: file => file.basename === 'main.css',
//         }),
//     ],
// });

const svg = require('../tasks/svg')({
    globs: [`${paths.src}/svg/**/*.svg`],
    base: paths.src,
    dist: paths.dist,
    var: paths.var,
});

const stat = require('../tasks/stats')({
    globs: [`${paths.src}/*.html`],
    var: paths.var,
    selectors: {
        'droidserif-regular': '.f-droid',
        'bitter_wght': '.f-bitter',
    },
});

const main = series(
    parallel(copy.main, svg.main, img.main, stat.main),
    parallel(svg.symbol, svg.scss, font.main),
    parallel(jsil.main, js.main, scss.main)
);
main.displayName = 'default';

const watch = parallel(copy.watch, svg.watch, jsil.watch, js.watch, scss.watch, font.watch);
watch.displayName = 'default:watch';

module.exports = [
    browsersync,
    clean,
    critical,
    copy.main,
    copy.watch,
    font.main,
    font.watch,
    img.main,
    img.watch,
    js.main,
    js.watch,
    jsil.main,
    jsil.watch,
    scss.main,
    scss.watch,
    svg.main,
    svg.watch,
    svg.scss,
    svg.symbol,
    main,
    watch,
];
