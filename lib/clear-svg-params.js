const through2 = require('through2');

module.exports = function () {
    // noinspection JSCheckFunctionSignatures
    return through2.obj(function (file, encoding, complete) {

        const contents = file.contents.toString(encoding)
            .replace(/{\$.*?:(.*?)}/g, function () {
                return arguments[1];
            });

        file.contents = Buffer.from(contents);
        this.push(file);

        complete();
    });
};
