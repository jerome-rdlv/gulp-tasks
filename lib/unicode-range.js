const csPromise = import('characterset');

exports.fromText = async function (text, locales = ['fr']) {
	const CharacterSet = (await csPromise).default;
	const segmenter = new Intl.Segmenter(locales, {granularity: 'grapheme'});
	const codes = Array.from(segmenter.segment(text), ({segment}) => segment.codePointAt(0));
	return new CharacterSet(codes).toHexRangeString();
};

exports.toText = async function (range) {
	const CharacterSet = (await csPromise).default;
	return CharacterSet.parseUnicodeRange(range).toArray().reduce((text, codePoint) => {
		return text + String.fromCodePoint(codePoint);
	}, '');
};

