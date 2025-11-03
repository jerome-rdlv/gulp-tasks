const {generateFontFace} = require('fontaine');
const path = require('path');
const srcParser = require('css-font-face-src');

// https://developer.mozilla.org/fr/docs/Web/CSS/@font-face/src
const from = [
	'opentype',
	'truetype',
];

const to = [
	{ext: 'woff2', format: 'woff2'},
	{ext: 'woff', format: 'woff'},
];

function getNode(rule, prop) {
	for (const node of rule.nodes) {
		if (node.type !== 'decl') {
			continue;
		}
		if (node.prop !== prop) {
			continue;
		}
		return node;
	}
	return null;
}

module.exports = () => {
	return {
		postcssPlugin: 'ttf-to-woff',
		AtRule: {
			'font-face': async function (rule, {result}) {
				const node = getNode(rule, 'src');
				if (!node) {
					return;
				}

				let sources = srcParser.parse(node.value);
				if (!sources) {
					return;
				}

				sources.forEach(source => {
					source.m = /(.*?)(-variations)?$/.exec(source.format || '');
				});

				const main = sources.filter(s => s.m[1] && from.includes(s.m[1]))[0];

				if (!main) {
					// no ttf/otf source found
					return;
				}

				const weight = getNode(rule, 'font-weight');

				if (weight && weight.value.split(' ').length == 2) {
					// weight is a range
					main.m[2] = '-variations';
				}

				const formats = to.map(o => o.format);

				// filter sources
				sources = sources.filter(s => !s.format || formats.includes(s.m[1]));

				// filter formats
				const existing = sources.filter(s => s.m[1]).map(s => s.m[1]);
				to
					.filter(item => !existing.includes(item.format))
					.forEach(({ext, format}) => {
						sources.push(Object.assign({}, main, {
							url: main.url.replace(/\.([a-z0-9]+)$/, '.' + ext),
							format: `${format}${main.m[2] || ''}`,
						}));
					});

				const src = sources.map(source => {
					return Object.entries(source)
						.filter(([key, value]) => key !== 'm' && value)
						.map(([key, value]) => {
							return `${key}("${value}")`;
						})
						.join(' ');
				}).join(', ');

				node.value = src;
			},
		},
	}
}
