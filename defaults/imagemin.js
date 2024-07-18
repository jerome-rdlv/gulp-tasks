const imagemin = require('gulp-imagemin');

module.exports = [
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({progressive: true}),
    // levels greater than 0 causes some black PNGs on Safari
    imagemin.optipng({optimizationLevel: 0})
];
