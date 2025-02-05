const subsetFont = require('subset-font');
const through2 = require('through2');

module.exports = function (chars) {
    // noinspection JSCheckFunctionSignatures
    return through2.obj(function (file, encoding, complete) {
        subsetFont(file.contents, chars, {
            targetFormat: 'woff2',
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
