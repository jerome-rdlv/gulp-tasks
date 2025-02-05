const Stream = require('stream');
const subset = require('./postcss-subset');
const {extract, drop} = require('../postcss/print-subset');

module.exports = function ({filter}) {
    return function () {
        var stream = new Stream.Transform({objectMode: true});
        stream._transform = function (file, encoding, complete) {
            if (file.isNull()) {
                return complete();
            }

            if (file.isStream()) {
                return complete('Streams are not supported!', file);
            }

            if (filter && !filter.test(file.path)) {
                return complete(null, file);
            }

            Promise.all([
                subset(this, file, [extract()], 'print'),
                subset(this, file, [drop()]),
            ]).then(() => complete());
        };

        return stream;
    };
};
