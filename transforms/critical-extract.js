const through = require('through2');
const critical = require('critical');
const Vinyl = require('vinyl');

module.exports = function (entries, opts, concurrency = exports.CONCURRENCY) {

    // noinspection JSCheckFunctionSignatures
    const stream = through.obj(function (file, encoding, complete) {
        complete(null, file);
    });

    const pending = Object.entries(entries);

    function handle([filename, url]) {
        // https://www.npmjs.com/package/critical
        return critical
            .generate({
                ...opts,
                extract: true,
                src: url,
            }, null)
            .then(({css}) => {
                stream.write(new Vinyl({
                    path: filename,
                    contents: Buffer.from(css),
                }));
            });
    }

    function consume() {
        const entry = pending.pop();
        return entry ? handle(entry).then(consume) : Promise.resolve();
    }

    Promise
        .all((Array(concurrency)).fill(0).map(() => consume()))
        .then(() => stream.end());

    return stream;
}

exports.CONCURRENCY = 4;
