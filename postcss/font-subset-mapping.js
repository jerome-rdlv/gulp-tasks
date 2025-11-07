const asset = require('../lib/asset');
const {generateFontFace} = require('fontaine');
const path = require('path');
const fs = require('fs');
const srcParser = require('css-font-face-src');
const processed = Symbol('processed');
const PluginError = require('plugin-error');
const FULL_RANGE = require('../transforms/font-subset').FULL_RANGE;
const {Comment, Declaration} = require('postcss');
const cssRuleMetadata = require('../lib/css-rule-metadata');

function getNode(rule, prop) {
	return rule.nodes.find(node => node.type === 'decl' && node.prop === prop);
}

module.exports = (mappingFile) => {

	return {
		postcssPlugin: 'font-subset-mapping',
		AtRule: {
			'font-face': async function (rule, {result}) {
				if (rule[processed]) {
					return;
				}

				rule[processed] = true;

				const node = getNode(rule, 'src');
				if (!node) {
					return;
				}

				// parse and keep only eligible sources with url
				let sources = srcParser.parse(node.value).filter(({url}) => url);
				if (!sources.length) {
					return;
				}

				if (!fs.existsSync(mappingFile)) {
					return;
				}

				result.messages.push({
					type: 'dependency',
					plugin: 'font-subset-mapping',
					file: mappingFile,
					parent: result.opts.from,
				});

				sources.forEach(source => {
					source.m = /(.*?)(-variations)?$/.exec(source.format || '');
					source.url = asset.resolve(source.url, result.opts.from);
				});

				const mappings = require(mappingFile);

				subsets = sources.map(({url}) => mappings[url]).filter(v => v)[0];

				if (!subsets) {
					throw new PluginError(
						'font-subset-mapping',
						new Error(`No subset mapping found for font src ${node.value}`),
						{
							fileName: result.opts.from,
							showStack: true,
						}
					);
				}

				const count = Object.values(subsets).length;

				Object.entries(subsets).forEach(([name, {range, sources}], index) => {
					// use cloneBefore to maintain subsets order
					const clone = rule.cloneBefore();
					clone[processed] = true;
					const node = getNode(clone, 'src');
					node.value = Object.entries(sources).map(([format, url]) => {
						url = path.relative((path.dirname(result.opts.from)), url);
						return `url('${url}') format(${format})`;
					}).join(', ');

					// add flag to font comment
					cssRuleMetadata.set(clone, 'subset', name);

					// remove possible existing unicode-range
					clone.nodes.filter(node => node.type === 'decl' && node.prop === 'unicode-range').forEach(node => node.remove());

					count > 1 && clone.append(new Declaration({prop: 'unicode-range', value: range}));
				});

				rule.remove();
			},
		},
	}
}
