const Stream = require('stream');
const csssubset = require('../lib/css-subset');
const {extract, drop} = require('../postcss/print-subset');

module.exports = function ({filter}) {
	var stream = new Stream.Transform({objectMode: true});
	stream._transform = function (file, encoding, complete) {
		if (file.isNull()) {
			return complete();
		}

		if (file.isStream()) {
			return complete('Streams are not supported!', file);
		}

		if (filter && !filter(file)) {
			return complete(null, file);
		}

		Promise.all([
			csssubset(this, file, [extract()], file.path.replace(/(\.[^.]+)$/, `.print$1`)),
			csssubset(this, file, [drop()]),
		]).then(() => complete());
	};

	return stream;
};
