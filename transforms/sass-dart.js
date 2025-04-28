const exec = require('child_process').exec;

module.exports = function (opts) {
	const args = Object.entries({
		silenceDeprecation: ['mixed-decls'],
		...opts,
	}).map(([arg, value]) => {
		return `--${arg.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}=${value instanceof Array ? value.join(',') : value}`;
	}).join(' ');

	return require('gulp-exec')(
		file => `/usr/bin/sass --embed-source-map --embed-sources ${args} "${file.path}"`,
		{
			continueOnError: false,
			pipeStdout: true,
		}
	).on('error', console.log);
};
