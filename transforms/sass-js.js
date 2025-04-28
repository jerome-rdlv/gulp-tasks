module.exports = function (opts) {
	opts = {
		outputStyle: 'expanded',
		precision: 8,
		silenceDeprecations: ['mixed-decls'],
		...opts,
	};
	const sass = require('gulp-sass')(require('sass'));
	return sass(opts, false).on('error', sass.logError);
}
