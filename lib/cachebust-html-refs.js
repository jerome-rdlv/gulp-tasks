const cacheBustUrl = require('./cachebust-url').get();
const getFileSignature = require('./get-file-signature').get();
const fs = require('fs');
const through = require('through2');

exports.get = function ({dist}) {
    return function () {
        // noinspection JSCheckFunctionSignatures
        return through.obj(function (file, encoding, complete) {
            const dom = new (require('jsdom').JSDOM)(file.contents.toString(encoding), {
                contentType: 'text/html',
            });

            dom.window.document.querySelectorAll('script[src], link[href], img[src], image, svg[data-src]').forEach(node => {
                let attr;
                switch (node.tagName) {
                    case 'script':
                    case 'img':
                        attr = 'src';
                        break;
                    case 'svg':
                        attr = 'data-src';
                        break;
                    case 'link':
                        attr = 'href';
                        break;
                    case 'image':
                        attr = 'xlink:href';
                        break;
                }
                if (attr) {
                    const url = node.getAttribute(attr);
                    const path = dist + url;
                    // handle http://, https:// and // (agnostic scheme)
                    if (!url.match(/^(https?:)?\/\//) && fs.existsSync(path)) {
                        node.setAttribute(attr, cacheBustUrl(
                            url,
                            getFileSignature(path)
                        ));
                    }
                }
                
            });

            file.contents = Buffer.from($.xml(), 'utf8');
            this.push(file);

            complete();
        });
    };
};
