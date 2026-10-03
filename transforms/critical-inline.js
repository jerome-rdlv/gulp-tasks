const {objectTransform: transform} = require('through2');
const critical = require('critical').default;

module.exports = function (opts) {
	// https://www.npmjs.com/package/critical
	return transform(function (file, encoding, complete) {
		critical({
			...opts,
			inline: true,
			src: file.path
		}).then(({html}) => {
			file.contents = Buffer.from(html);
			complete(null, file);
		});
	});
}
