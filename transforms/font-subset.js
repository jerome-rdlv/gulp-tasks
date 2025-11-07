const subsetFont = require('subset-font');
const fontverter = require('fontverter');
const through = require('through2');
const PluginError = require('plugin-error');
const unicodeRange = require('../lib/unicode-range');

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/unicode-range
 */
exports.transform = function (subsets) {

	const map = {};

	function eachFile(file, encoding, complete) {

		// resolve subsets
		const fsubsets = typeof subsets === 'function'
			? subsets.call(null, file)
			: (typeof subsets === 'string' ? [{name: 'c', text: subsets}] : subsets);

		if (fsubsets === false) {
			// no subsetting for this particular font
			file.subset = {
				range: exports.FULL_RANGE,
				name: 'full',
			};
			this.push(file);

			complete();
			return;
		}

		Promise.all(fsubsets.map(async ({name, text, range}) => {

			if (!name) {
				throw new Error(`A subset must have a name.`);
			}

			if (!text && !range) {
				throw new Error(`A subset must have either a text or ar range.`);
			}

			if (!text) {
				text = await unicodeRange.toText(range);
			}

			if (!range) {
				range = await unicodeRange.fromText(text);
				// update text from range to benefit from deduplication and sorting
				text = await unicodeRange.toText(range);
			}

			return subsetFont(file.contents, text, {
				targetFormat: exports.FORMATS[file.extname.substring(1)],
			}).then(buffer => {
				const clone = file.clone({contents: false});
				clone.contents = buffer;
				clone.stem = `${clone.stem}.${name}`;
				clone.subset = {range, name};
				return clone;
			});
		}))
			.then((files) => {
				// important: push files here to maintain subsets order
				files.forEach(file => this.push(file));
				complete();
			})
			.catch(e => {
				throw new PluginError('font-subset', e, {
					fileName: file.path,
					showStack: true,
				});
			});
	}

	return through.obj(eachFile);
};

exports.FORMATS = {
	woff: 'woff',
	woff2: 'woff2',
	ttf: 'sfnt',
	otf: 'sfnt',
}

exports.FULL_RANGE = 'U+0-10FFFF';

exports.SUBSETS = [
	{
		name: 'latin',
		range: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	{
		name: 'latin-ext',
		range: 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
	},
];
