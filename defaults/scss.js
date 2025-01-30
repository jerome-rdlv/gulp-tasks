module.exports = {
    engine: 'dart',
    transforms: [
        require('postcss-pxtorem')(require('../defaults/pxtorem')),
        require('postcss-preset-env'),
    ],
    optimizations: [
        require('cssnano'),
        // add cachebusting here
    ],
    split: {
        // Lighthouse Moto G Power test device screen is 412px wide (26em × 16px)
        breakpoint: 26,
        filter: /main\.css$/,
    },
};
