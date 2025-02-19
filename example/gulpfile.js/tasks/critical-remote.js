const extract = require('../../../lib/critical-extract');
const gulp = require('gulp');

module.exports = function (paths) {
	function main() {
		return extract(
			{
				'front.css': 'https://rue-de-la-vieille.fr',
				'portfolio.css': 'https://rue-de-la-vieille.fr/portfolio/',
				'integration.css': 'https://rue-de-la-vieille.fr/integrateur-responsive/',
				'wordpress.css': 'https://rue-de-la-vieille.fr/developpeur-wordpress/',
				'symfony.css': 'https://rue-de-la-vieille.fr/developpeur-symfony/',
			},
			require('../../../defaults/critical')
		).pipe(gulp.dest(`${paths.dist}/css/critical`));
	}

	main.displayName = 'critical:remote';
	return main;
};
