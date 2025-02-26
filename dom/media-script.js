module.exports = function ({document}) {
	document.querySelectorAll('script[src][data-media]').forEach(node => {
		node.dataset.src = node.src;
		node.removeAttribute('src');
	});
};
