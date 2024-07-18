const cacheBustUrl = require('./cachebust-url').get();
const getFileSignature = require('./get-file-signature').get();
const fs = require('fs');
const through2 = require('through2');

exports.get = function ({dist}) {
    return function () {
        // noinspection JSCheckFunctionSignatures
        return through2.obj(function (file, encoding, complete) {
            const dom = new (require('jsdom').JSDOM)(file.contents.toString(encoding), {
                contentType: 'image/svg+xml',
            });
            Array.prototype.forEach.call(dom.window.document.querySelectorAll('svg image'), node => {
                const href = node.getAttribute('xlink:href');
                const path = `${dist}/svg/${href}`;
                if (fs.existsSync(path)) {
                    node.setAttribute('xlink:href', cacheBustUrl(href, getFileSignature(path)));
                }
            });

            file.contents = Buffer.from(dom.serialize(), 'utf8');
            this.push(file);

            complete();
        });
    };
};
