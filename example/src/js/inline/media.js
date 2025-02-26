document.querySelectorAll('script[data-media]').forEach(function (node) {
	(new Promise(function (resolve) {
		if (!window.matchMedia) {
			return resolve();
		}
		const mql = window.matchMedia(node.dataset.media);
		if (mql.matches) {
			return resolve();
		}
		mql.addEventListener('change', function handler(e) {
			if (e.matches) {
				mql.removeEventListener('change', handler);
				resolve();
			}
		});
	})).then(function () {
		node.src = node.dataset.src;
	});
});
