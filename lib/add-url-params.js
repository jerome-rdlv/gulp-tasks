module.exports = function (url, params) {
	const urlObject = (() => {
		try {
			return new URL(url);
		} catch (e) {
			throw new Error(`${e.message}: ${url}`);
		}
	})();
	params.entries().forEach(([key, value]) => {
		urlObject.searchParams.append(key, value);
	});
	return urlObject.toString();
};
