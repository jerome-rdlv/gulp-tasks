const csssubset = require('./css-subset');
const Stream = require('stream');
const {extract, drop} = require('../postcss/fonts-subset');

module.exports = function ({filter}) {
    return function () {
        var stream = new Stream.Transform({objectMode: true});
        stream._transform = function (file, encoding, complete) {
            if (!file || file.isNull()) {
                return complete();
            }

            if (filter && !filter(file)) {
                return complete(null, file);
            }

            if (file.isStream()) {
                return complete('Streams are not supported!', file);
            }

            Promise.all([
                csssubset(this, file, [extract()], 'fonts'),
                csssubset(this, file, [drop()]),
            ]).then(() => complete());
        };

        return stream;
    };
};
