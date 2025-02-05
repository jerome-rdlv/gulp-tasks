const gulp = require('gulp');
const touch = require('../lib/touch');
const through = require('through2');
const Vinyl = require('vinyl');

const defaults = {
    output: 'stats.json',
    exclude: 'script,noscript',
};

function generateTable(output, exclude, selectors) {
    const classes = new Set();
    const ids = new Set();
    const text = {all: ''};

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
        text.all += dom.window.document.body.textContent;

        // count chars for specific selectors
        Object.entries(selectors || {}).forEach(([key, selector]) => {
            // noinspection JSCheckFunctionSignatures
            dom.window.document.querySelectorAll(selector).forEach(node => {
                text[key] = (text[key] || '') + node.textContent;
            });
        });

        callback();
    }

    function endStream(callback) {
        try {
            // get unique char lists
            Object.keys(text).forEach(key => {
                text[key] = Array.from(new Set(text[key])).sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join('');
            });
            this.push(new Vinyl({
                path: output,
                contents: Buffer.from(JSON.stringify({
                    text: text,
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
            .pipe(generateTable(config.output, config.exclude, config.selectors))
            .pipe(gulp.dest(config.var))
            .pipe(touch());
    };

    main.displayName = 'stats';

    return {
        main,
    };
};
