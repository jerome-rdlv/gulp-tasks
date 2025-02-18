const through = require('through2');
const {optimize} = require('svgo');

module.exports = function (configCallback) {
    // noinspection JSCheckFunctionSignatures
    return through.obj(function (file, encoding, complete) {

        const contents = file.contents.toString(encoding);
        const output = optimize(contents, configCallback(file))

        file.contents = Buffer.from(output.data);
        this.push(file);

        complete();
    });
};
