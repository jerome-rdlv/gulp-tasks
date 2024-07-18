const crypto = require('crypto');
const fs = require('fs');

const defaults = exports.config = {
    signature: 'md5',
};

exports.get = function (config) {
    config = {...defaults, ...config};
    switch (config.signature) {
        case 'md5':
        case 'sha1':
            return function hash(path) {
                const hash = crypto.createHash(config.signature);
                hash.setEncoding('hex');
                hash.write(fs.readFileSync(path));
                hash.end();
                return hash.read();
            };
        case 'timestamp':
            return function timestamp(path) {
                return Math.round(fs.statSync(path).mtime.getTime() / 1000);
            };
        default:
            return function none() {
                return '';
            };
    }
};
