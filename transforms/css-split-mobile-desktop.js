const csssubset = require('../lib/css-subset');
const Stream = require('stream');
const {extract, drop} = require('../postcss/desktop-subset');

module.exports = function ({filter, breakpoint = 26}) {
	var stream = new Stream.Transform({objectMode: true});
	stream._transform = function (file, encoding, complete) {
		if (!file || file.isNull()) {
			return complete();
		}

		if (file.isStream()) {
			return complete('Streams are not supported!', file);
		}

		if (!breakpoint || (filter && !filter(file.relative))) {
			return complete(null, file);
		}

		Promise.all([
			csssubset(this, file, [extract(breakpoint)], file.path.replace(/(\.[^.]+)$/, `.desktop$1`)),
			csssubset(this, file, [drop(breakpoint)], file.path.replace(/(\.[^.]+)$/, `.mobile$1`)),
		]).then(() => complete(null, file));
	};

	return stream;
};
