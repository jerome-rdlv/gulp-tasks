const subset = require('./postcss-subset');
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

            if (!opts.breakpoint || !opts.filter.test(file.path)) {
                return complete(null, file);
            }

            this.push(file);

            Promise.all([
                subset(this, file, [extract(opts.breakpoint)], 'desktop'),
                subset(this, file, [drop(opts.breakpoint)], 'mobile'),
            ]).then(() => complete());
        };

        return stream;
    };
};
