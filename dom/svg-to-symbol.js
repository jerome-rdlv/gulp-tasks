const path = require('path');

module.exports = function ({document, file}) {

	const svg = document.firstChild;
	const symbol = document.createElement('symbol');

	const id = path.basename(file.relative, path.extname(file.relative)).replace(/_/, '-');
	symbol.setAttribute('id', `icon-${id}`);

	['viewBox', 'preserveAspectRatio'].forEach(attr => {
		if (svg.hasAttribute(attr)) {
			symbol.setAttribute(attr, svg.getAttribute(attr));
		}
	});

	symbol.append(...svg.childNodes);
	svg.remove();
	document.append(symbol);
};
