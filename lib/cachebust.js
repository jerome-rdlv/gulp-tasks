module.exports = function (paths) {
	return ((getFileSignature, cachebustUrl) => {
		return (url, path) => {
			return cachebustUrl.add(url, getFileSignature(`${paths.dist}/${path}`));
		};
	})(
		require('./get-file-signature')(),
		require('./cachebust-url')()
	);
};
