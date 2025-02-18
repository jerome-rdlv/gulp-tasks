const gulp = require('gulp');
const inline = require('../../../lib/critical-inline');

module.exports = function (paths) {
	function main() {
		return gulp.src([
			`${paths.dist}/**/*.html`,
			`!${paths.dist}/report.html`,
		])
			.pipe(inline(require('../../../defaults/critical')))
			.pipe(gulp.dest(paths.dist))
			;
	}

	main.displayName = 'critical:local';
	return main;
};
