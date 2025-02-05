const csssubset = require('./css-subset');
const Stream = require('stream');
const {extract, drop} = require('../postcss/desktop-subset');

module.exports = function (opts) {
    return function () {
        var stream = new Stream.Transform({objectMode: true});
        stream._transform = function (file, encoding, complete) {
            if (!file || file.isNull()) {
                return complete();
            }

            if (file.isStream()) {
                return complete('Streams are not supported!', file);
            }

            if (!opts.breakpoint || (opts.filter && !opts.filter(file))) {
                return complete(null, file);
            }

            this.push(file);

            Promise.all([
                csssubset(this, file, [extract(opts.breakpoint)], 'desktop'),
                csssubset(this, file, [drop(opts.breakpoint)], 'mobile'),
            ]).then(() => complete());
        };

        return stream;
    };
};
