/**
 * Some options can be overridden by CLI arguments:
 *  - --url=http://example.org
 *  - --production or --prod
 */
const {series, parallel} = require('gulp');
const yargs = require('yargs');
const {hideBin} = require('yargs/helpers');
const path = require('path');

const paths = {
    base: `${__dirname}/src`,
    dist: `${__dirname}/assets`,
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
    globs: `${paths.base}/img/**/*.+(gif|jpg|jpeg|png)`,
    base: paths.base,
    dist: paths.dist
});

const browsersync = require('../tasks/browsersync')({
    proxy: argv['url'],
    files: [`${paths.dist}/**/*`]
});

const js = require('../tasks/js')({
    globs: [
        `${paths.base}/js/main.js`,
    ],
    base: paths.base,
    dist: paths.dist
});

const jsil = require('../tasks/jsil')({
    globs: [`${paths.base}/js/inline/*.js`],
    base: paths.base,
    dist: paths.dist
});

const copy = require('../tasks/copy')({
    globs: [`${paths.base}/font/*.{woff,woff2}`],
    base: paths.base,
    dist: paths.dist
});

const scss = require('../tasks/scss')({
    base: paths.base,
    dist: paths.dist,
    ...require('../defaults/scss'),
    ...{
        // print: /main\.css$/,
        nooptims: [
            'editor.css',
        ],
        globs: [
            `${paths.base}/scss/**/*.scss`,
        ],
        watch: [
            `${paths.var}/_svg.scss`,
            path.resolve(paths.base + '/../blocks') + '/**/*.scss',
        ],
    }
});

const svg = require('../tasks/svg')({
    globs: [`${paths.base}/svg/**/*.svg`],
    base: paths.base,
    dist: paths.dist,
    var: paths.var,
});

const main = series(
    parallel(copy.main, svg.main, img.main),
    parallel(svg.symbol, svg.scss),
    parallel(jsil.main, js.main, scss.main)
);
main.displayName = 'default';

const watch = parallel(copy.watch, svg.watch, jsil.watch, js.watch, scss.watch);
watch.displayName = 'default:watch';

module.exports = [
    browsersync,
    clean,
    critical,
    copy.main,
    copy.watch,
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
