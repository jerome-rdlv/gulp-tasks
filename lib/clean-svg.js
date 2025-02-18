const through = require('through2');

module.exports = function () {
    // noinspection JSCheckFunctionSignatures
    return through.obj(function (file, encoding, complete) {
        const dom = new (require('jsdom').JSDOM)(file.contents.toString(encoding), {
            contentType: 'image/svg+xml',
        });
        const svg = dom.window.document.querySelector('svg');

        svg.getElementById('svgo-options')?.remove();

        file.contents = Buffer.from(dom.serialize(), 'utf8');
        this.push(file);

        complete();
    });
};
