const subsetFont = require('subset-font');
const through2 = require('through2');

module.exports = function (subset) {
    // noinspection JSCheckFunctionSignatures
    return through2.obj(function (file, encoding, complete) {

        const text = typeof subset === 'function' ? subset.call(null, file) : subset;

        if (typeof text !== 'string' || !text.length) {
            return complete(null, file);
        }

        subsetFont(file.contents, text, {
            targetFormat: file.extname.replace(/^\./, ''),
        }).then(buffer => {
            file.contents = buffer;
            // this.push(file);
            complete(null, file);
        }).catch(e => {
            console.error(`font-subset: ${file.relative}: ${e}`);
            complete(false, file);
        });
    });
};
