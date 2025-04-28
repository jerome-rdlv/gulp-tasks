const through = require('through2');
const critical = require('critical');

module.exports = function (opts) {
	// https://www.npmjs.com/package/critical
	// noinspection JSCheckFunctionSignatures
	return through.obj(function (file, encoding, complete) {
		critical
			.generate({
				...opts,
				inline: true,
				src: file.path
			}, null)
			.then(({html}) => {
				file.contents = Buffer.from(html);
				complete(null, file);
			});
	});
}
