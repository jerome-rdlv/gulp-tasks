/**
 * Some options can be overridden by CLI arguments:
 *  - --url=http://example.org
 *  - --production or --prod
 */
const {series, parallel} = require('gulp');
const yargs = require('yargs');
const {hideBin} = require('yargs/helpers');
const path = require('path');

const config = {
    base: `${__dirname}/src`,
    dist: `${__dirname}/assets`,
    var: `${__dirname}/var`,
};

const argv = yargs(hideBin(process.argv)).parse();

function load(task, override) {
    return (task instanceof Function ? task : require(`../tasks/${task}`))({
        ...config,
        ...override
    });
}

const clean = require('../tasks/clean')([
    `${config.var}/*`,
    `${config.dist}/*`,
    `!${config.dist}/report.html`,
]);

const critical = load('critical', {
    dist: `${config.dist}/css/critical`,
    entries: [
        {name: 'front-page.php', url: argv['url']},
    ],
});

const img = load('img', {
    globs: `${config.base}/img/**/*.+(gif|jpg|jpeg|png)`,
});

const browsersync = load('browsersync', {
    proxy: argv['url'],
    files: [`${config.dist}/**/*`]
});

const js = load('js', {
    globs: [
        `${config.base}/js/main.js`,
    ],
});

const jsil = load('jsil', {
    globs: [`${config.base}/js/inline/*.js`],
});

const copy = load('copy', {
    globs: [`${config.base}/font/*.{woff,woff2}`],
});

const scss = load('scss', {
    ...config,
    ...require('../defaults/scss'),
    ...{
        print: /main\.css$/,
        nooptims: [
            'editor.css',
        ],
        globs: [
            `${config.base}/scss/**/*.scss`,
        ],
        watch: [
            `${config.var}/_svg.scss`,
            path.resolve(config.base + '/../blocks') + '/**/*.scss',
        ],
    }
});

const svg = load('svg', {
    globs: [`${config.base}/svg/**/*.svg`],
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
