const fs = require('fs');

module.exports = function (opts) {
	opts = {
		signature: exports.SIGN_MD5,
		shorten: 5,
		cache: require('./cache'),
		...opts
	};

	function check(path) {
		if (!fs.existsSync(path)) {
			throw new Error(`${path} does not exist`);
		}
	}

	const sign = (signature => {
		const fs = require('fs');
		switch (signature) {
			case exports.SIGN_MD5:
			case exports.SIGN_SHA1:
				return function hash(path) {
					check(path);
					return require('crypto').createHash(opts.signature)
						.update(fs.readFileSync(path))
						.digest()
						.toString('hex')
						.substring(0, Math.max(0, opts.shorten) || undefined);
				};
			case exports.SIGN_TIMESTAMP:
				return function timestamp(path) {
					check(path);
					return Math.round(fs.statSync(path).mtime.getTime() / 1000);
				};
			default:
				return function none() {
					return '';
				};
		}
	})(opts.signature);

	return opts.cache ? opts.cache(sign) : sign;
};

exports.SIGN_MD5 = 'md5';
exports.SIGN_SHA1 = 'sha1';
exports.SIGN_TIMESTAMP = 'timestamp';
