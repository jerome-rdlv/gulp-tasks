const {Comment} = require('postcss');

const prefix = '!md:';

function getComment(rule) {
	return rule.nodes.find(node => node.type === 'comment' && node.text?.substring(0, prefix.length) === prefix);
}

function getData(commentNode) {
	try {
		return JSON.parse(commentNode.text.substring(prefix.length).trim()) || {};
	} catch {
		return {};
	}
}

exports.get = function (rule, key = null) {
	const data = getData(getComment(rule));
	return key ? data[key] : data;
}

exports.set = function (rule, key, value) {
	const comment = getComment(rule)?.remove();
	const data = getData(comment);
	data[key] = value;
	rule.prepend(new Comment({text: `${prefix}${JSON.stringify(data)}`}));
}

exports.clear = function (rule) {
	getComment(rule)?.remove();
}
