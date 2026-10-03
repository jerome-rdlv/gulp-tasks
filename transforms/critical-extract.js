const {objectTransform: transform} = require('through2');
const critical = require('critical').default;
const Vinyl = require('vinyl');

module.exports = function (entries, opts, concurrency = exports.CONCURRENCY) {

	const stream = transform(function (file, encoding, complete) {
		complete(null, file);
	});

	const pending = Object.entries(entries);

	function handle([filename, url]) {
		// https://www.npmjs.com/package/critical
		return critical({
			...opts,
			extract: true,
			src: url,
		}).then(({css}) => {
			stream.write(new Vinyl({
				path: filename,
				contents: Buffer.from(css),
			}));
		});
	}

	function consume() {
		const entry = pending.pop();
		return entry ? handle(entry).then(consume) : Promise.resolve();
	}

	Promise
		.all((Array(concurrency)).fill(0).map(() => consume()))
		.then(() => stream.end());

	return stream;
}

exports.CONCURRENCY = 4;
