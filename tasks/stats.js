const gulp = require('gulp');
const touch = require('../lib/touch');
const through = require('through2');
const Vinyl = require('vinyl');

const defaults = {
    output: 'stats.json',
    exclude: 'script,noscript',
};

function generateTable(output, exclude) {
    const classes = new Set();
    const ids = new Set();
    let chars = '';

    function eachFile(file, encoding, callback) {
        const html = file.contents.toString();
        const dom = new (require('jsdom').JSDOM)(html, {
            contentType: 'text/html',
        });
        for (const node of dom.window.document.querySelectorAll('*')) {
            node.id && ids.add(node.id);
            node.classList.forEach(className => {
                classes.add(className);
            });
        }

        // clean then count chars
        dom.window.document.querySelectorAll(exclude).forEach(node => node.remove());
        chars += dom.window.document.body.textContent;

        callback();
    }

    function endStream(callback) {
        try {
            this.push(new Vinyl({
                path: output,
                contents: Buffer.from(JSON.stringify({
                    chars: Array.from(new Set(chars)).sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join(''),
                    classes: Array.from(classes),
                    ids: Array.from(ids),
                }, null, '\t'), 'utf8')
            }));
            callback();
        } catch (error) {
            callback(error);
        }
    }

    return through.obj(eachFile, endStream, false);
}

module.exports = function (config) {
    config = {...defaults, ...config};
    const main = function () {
        return gulp.src(config.globs)
            .pipe(generateTable(config.output, config.exclude))
            .pipe(gulp.dest(config.var))
            .pipe(touch());
    };

    main.displayName = 'stats';

    return {
        main,
    };
};
