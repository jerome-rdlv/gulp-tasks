const crypto = require('crypto');
const fs = require('fs');

const defaults = exports.config = {
    signature: 'md5',
    shorten: 7,
};

exports.get = function (config) {
    config = {...defaults, ...config};
    switch (config.signature) {
        case 'md5':
        case 'sha1':
            return function hash(path) {
                return crypto.createHash(config.signature)
                    .update(fs.readFileSync(path))
                    .digest()
                    .toString('hex')
                    .substring(0, Math.max(0, config.shorten) || undefined);
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
