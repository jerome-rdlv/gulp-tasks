const valueParser = require('postcss-value-parser');
const {isEqual} = require('lodash');

function getFamily(value, aliases = {}) {
	if (value.type !== 'word' && (value.type !== 'function' || value.value !== 'var')) {
		return;
	}
	const family = value.value === 'var' ? valueParser.stringify(value) : value.value;
	return aliases[family] || family;
}

function getProperties(rule) {
	const opts = {};
	rule.walkDecls(/(text-transform)/, decl => {
		opts[decl.prop] = decl.value;
	});
	return opts;
}

function getFont(fonts, opts) {
	for (const font of fonts) {
		if (isEqual(font.opts, opts)) {
			return font;
		}
	}
	return (fonts || [])[0];
}

const props = new RegExp(`${[
	'font-family',
	'src',
	'font-weight',
	'font-style',
].join('|')}`);

module.exports = function (aliases) {
	const metadata = {};
	return {
		postcssPlugin: 'font-metadata',
		data: metadata,
		AtRule: {
			'font-face': rule => {
				const font = {family: null, opts: {}, src: null, flags: {}};
				rule.walkComments(comment => {
					try {
						Object.entries(JSON.parse(comment.text.replace(/^!/, ''))).forEach(([prop, value]) => {
							font.flags[prop] = value;
						});
					} catch {
					}
				});
				rule.walkDecls(props, decl => {
					switch (decl.prop) {
						case 'font-family':
							font.family = decl.value.replaceAll('"', '');
							return;
						case 'font-weight':
						case 'font-style':
							font.opts[decl.prop.replace(/^font-/, '')] = decl.value;
							return;
						case 'src':
							const src = valueParser(decl.value).nodes[0];
							if (src.type !== 'function' || src.value !== 'url') {
								return;
							}
							font.src = src.nodes[0].value;
							let key = font.src.split('/');
							font.key = key[key.length - 1].split('.')[0];
							return;

					}
				});
				if (!font.src) {
					return;
				}
				if (!metadata[font.family]) {
					metadata[font.family] = {
						family: font.family,
						fonts: [],
					};
				}
				metadata[font.family].fonts.push(font);
			},
		},
		Declaration: {
			'font-family': decl => {
				if (decl.parent && decl.parent.type === 'atrule' && decl.parent.name === 'font-face') {
					return;
				}
				const properties = getProperties(decl.parent);
				const parsed = valueParser(decl.value);
				parsed.walk(value => {
					const family = getFamily(value, aliases);
					if (!family) {
						return;
					}
					if (!metadata[family]) {
						return;
					}
					if (!metadata[family].selectors) {
						metadata[family].selectors = [];
					}
					// try to add to an existing selector with same properties
					for (const item of metadata[family].selectors) {
						if (isEqual(item[1], properties)) {
							item[0] += ',' + decl.parent.selector;
							return;
						}
					}
					metadata[family].selectors.push([decl.parent.selector, properties]);
				});
			},
		},
	};
}
