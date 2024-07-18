const cacheBustUrl = require('./cachebust-url').get();
const getFileSignature = require('./get-file-signature').get();
const through2 = require('through2');
const fs = require('fs');
const path = require('path');

const regex = /url\((?!['"]?(?:data:|https?:\/\/|#|%23))['"]?([^'")]*)['"]?\)/g;

exports.get = function ({base, dist}) {
    return function () {
        // noinspection JSCheckFunctionSignatures
        return through2.obj(function (file, encoding, complete) {

            const contents = file.contents.toString(encoding)
                .replace(regex, function (match, url) {
                    if (!url) {
                        return match;
                    }

                    // if (/^(%23|#)/.test(url)) {
                    //     // URL is a hash (begins with # or %23)
                    //     return match;
                    // }
                    const filepath = path.normalize(
                        `${file.dirname.replace(base, dist)}/${url}`
                    );
                    if (!fs.existsSync(filepath)) {
                        return match;
                    }

                    return `url(${cacheBustUrl(url, getFileSignature(filepath))})`;
                });

            file.contents = Buffer.from(contents);
            this.push(file);

            complete();
        });
    };
};
