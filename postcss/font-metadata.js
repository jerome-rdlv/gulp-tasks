const path = require('path');
const asset = require('../lib/asset');
const valueParser = require('postcss-value-parser');
const {isEqual} = require('lodash');
const cssRuleMetadata = require('../lib/css-rule-metadata');

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

function hash(font) {
	return require('crypto').createHash('md5').update(`${font.family}|${JSON.stringify(font.opts)}`).digest().toString('hex');
}

module.exports = function (aliases) {
	const metadata = {};
	return {
		postcssPlugin: 'font-metadata',
		data: metadata,
		AtRule: {
			'font-face': (rule, {result}) => {
				const font = {family: null, opts: {}, subsets: {}, flags: {}};

				Object.entries(cssRuleMetadata.get(rule)).forEach(([prop, value]) => {
					font.flags[prop] = value;
				});
				cssRuleMetadata.clear(rule);

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

							font.src = asset.resolve(src.nodes[0].value, result.opts.from).replace(/#.*$/, '');
							font.key = path.basename(font.src).split('.')[0];
							if (font.flags.subset) {
								font.subsets[font.flags.subset] = font.src;
								delete font.src;
							}
							return;
					}
				});

				if (!font.src && !Object.values(font.subsets).length) {
					return;
				}

				if (!metadata[font.family]) {
					metadata[font.family] = {
						family: font.family,
						fonts: [],
					};
				}

				if (!Object.values(font.subsets).length) {
					delete font.subsets;
				}

				font.hash = hash(font);
				const existing = metadata[font.family].fonts.find(candidate => candidate.hash === font.hash);

				if (font.subsets && existing) {
					existing.subsets = {...existing.subsets, ...font.subsets};
				} else {
					metadata[font.family].fonts.push(font);
				}

				delete font.flags.subset;
				delete font.family;
			},
		},
		Declaration: {
			'font-family': decl => {
				if (decl.parent && decl.parent.type === 'atrule' && decl.parent.name === 'font-face') {
					return;
				}
				if (!decl.parent.selector) {
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
					const selector = decl.parent.selector.replace(/\s+/g, ' ');
					// try to add to an existing selector with same properties
					for (const item of metadata[family].selectors) {
						if (isEqual(item[1], properties)) {
							item[0] += ',' + selector;
							return;
						}
					}
					metadata[family].selectors.push([selector, properties]);
				});
			},
		},
	};
}
