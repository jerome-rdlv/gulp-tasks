const cacheBustUrl = require('./cachebust-url').get();
const getFileSignature = require('./get-file-signature').get();
const cheerio = require('cheerio');
const fs = require('fs');
const through = require('through2');

exports.get = function ({dist}) {
    return function () {
        // noinspection JSCheckFunctionSignatures
        return through.obj(function (file, encoding, callback) {
            const $ = cheerio.load(file.contents.toString(encoding), require('../defaults/cheerio'));

            $('script[src], link[href], img[src], image, svg[data-src]').each(function () {
                const $asset = $(this);
                let attr;
                switch ($asset[0].tagName) {
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
                    const url = $asset.attr(attr);
                    const path = dist + url;
                    // handle http://, https:// and // (agnostic scheme)
                    if (!url.match(/^(https?:)?\/\//) && fs.existsSync(path)) {
                        $asset.attr(attr, cacheBustUrl(
                            url,
                            getFileSignature(path)
                        ));
                    }
                }
            });

            file.contents = Buffer.from($.xml(), 'utf8');
            this.push(file);

            callback();
        });
    };
};
