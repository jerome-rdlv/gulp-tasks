const postcss = require('postcss');
const through = require('through2');
const Vinyl = require('vinyl');

module.exports = function (plugins) {

    function eachFile(file, encoding, complete) {
        postcss(Object.values(plugins)).process(file.contents).then(() => complete(null, file))
    }

    function endStream(callback) {
        try {
            Object.entries(plugins).forEach(([output, {data}]) => {
                this.push(new Vinyl({
                    path: output,
                    contents: Buffer.from(JSON.stringify(Object.values(data), null, '\t'), 'utf8')
                }));
            });
            callback();
        } catch (error) {
            callback(error);
        }
    }

    return through.obj(eachFile, endStream, false);
};
