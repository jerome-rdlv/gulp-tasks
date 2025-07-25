module.exports = function (plugins, paths, rename = null) {
	return function (file) {
		const clone = file.clone({deep: false, contents: false});
		rename && rename(clone);
		return {
			plugins: plugins,
			options: {to: clone.path.replace(paths.src, paths.dist)}
		};
	};
}
