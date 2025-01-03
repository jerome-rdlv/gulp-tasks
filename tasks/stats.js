const gulp = require('gulp');
const touch = require('../lib/touch');
const through = require('through2');
const Vinyl = require('vinyl');

const defaults = {
    output: 'stats.json',
};

function generateTable(output) {
    const classes = new Set();
    const ids = new Set();

    function eachFile(file, encoding, callback) {
        const html = file.contents.toString(encoding);
        const dom = new (require('jsdom').JSDOM)(html, {
            contentType: 'text/html',
        });
        for (const node of dom.window.document.querySelectorAll('*')) {
            node.id && ids.add(node.id);
            node.classList.forEach(className => {
                classes.add(className);
            });
        }
        callback();
    }

    function endStream(callback) {
        try {
            this.push(new Vinyl({
                path: output,
                contents: Buffer.from(JSON.stringify({
                    classes: Array.from(classes),
                    ids: Array.from(ids),
                }), 'utf8')
            }));
            callback();
        } catch (error) {
            callback(error);
        }
    }

    return through.obj(eachFile, endStream);
}

module.exports = function (config) {
    config = {...defaults, ...config};
    const main = function () {
        return gulp.src(config.globs, {base: config.base})
            .pipe(generateTable(config.output))
            .pipe(gulp.dest(config.var)).pipe(touch());
    };

    main.displayName = 'stats';

    return {
        main,
    };
};
