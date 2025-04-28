const csssubset = require('../lib/css-subset');
const Stream = require('stream');
const {extract, drop} = require('../postcss/desktop-subset');

module.exports = function (opts) {
	var stream = new Stream.Transform({objectMode: true});
	stream._transform = function (file, encoding, complete) {
		if (!file || file.isNull()) {
			return complete();
		}

		if (file.isStream()) {
			return complete('Streams are not supported!', file);
		}

		if (!opts.breakpoint || (opts.filter && !opts.filter(file))) {
			return complete(null, file);
		}

		Promise.all([
			csssubset(this, file, [extract(opts.breakpoint)], file.path.replace(/(\.[^.]+)$/, `.desktop$1`)),
			csssubset(this, file, [drop(opts.breakpoint)], file.path.replace(/(\.[^.]+)$/, `.mobile$1`)),
		]).then(() => complete(null, file));
	};

	return stream;
};
