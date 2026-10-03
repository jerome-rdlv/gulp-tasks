const imagemin = import('gulp-imagemin');

module.exports = imagemin.then(imagemin => [
	imagemin.gifsicle({interlaced: true}),
	// broken
	// imagemin.mozjpeg({progressive: true, quality: 85}),
	// levels greater than 0 causes some black PNGs on Safari
	imagemin.optipng({optimizationLevel: 0})
]);
