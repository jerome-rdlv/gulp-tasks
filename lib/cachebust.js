module.exports = function (paths) {
	return ((getFileSignature, cachebustUrl) => {
		return (url, path) => {
			return cachebustUrl.add(url, getFileSignature(`${paths.dist}/${path}`));
		};
	})(
		require('gulp-tasks/lib/get-file-signature')(),
		require('gulp-tasks/lib/cachebust-url')()
	);
};
