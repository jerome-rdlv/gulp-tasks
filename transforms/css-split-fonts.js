const csssubset = require('../lib/css-subset');
const Stream = require('stream');
const {extract, drop} = require('../postcss/fonts-subset');

module.exports = function ({remove, filter}) {
	var stream = new Stream.Transform({objectMode: true});
	stream._transform = function (file, encoding, complete) {
		if (!file || file.isNull()) {
			return complete();
		}

		if (filter && !filter(file)) {
			return complete(null, file);
		}

		if (file.isStream()) {
			return complete('Streams are not supported!', file);
		}

		const tasks = [
			csssubset(this, file, [extract()], file.path.replace(/(\.[^.]+)$/, `.fonts$1`)),
		];

		if (remove) {
			tasks.push(csssubset(this, file, [drop()]));
		} else {
			this.push(file);
		}

		Promise.all(tasks).then(() => complete());
	};

	return stream;
};
