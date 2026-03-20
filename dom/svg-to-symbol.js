const path = require('path');

module.exports = function (base = null) {
	return function ({document, file}) {

		const svg = document.firstChild;
		const symbol = document.createElement('symbol');

		const rel = base ? path.relative(base, file.relative) : file.relative;
		const id = ('icon/' + rel.substring(0, rel.length - file.extname.length))
			// replace non-alphanumeric characters with dash
			.replace(/[^a-z0-9\/]+/ig, '-')
			// replace slashes with double dash
			.replace(/[\/]+/ig, '--')
			// drop non-alpha leading characters
			.replace(/^[^a-z]+/i, '');
		symbol.setAttribute('id', id);

		['viewBox', 'preserveAspectRatio'].forEach(attr => {
			if (svg.hasAttribute(attr)) {
				symbol.setAttribute(attr, svg.getAttribute(attr));
			}
		});

		symbol.append(...svg.childNodes);
		svg.remove();
		document.append(symbol);
	};
};
