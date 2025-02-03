module.exports = {
    engine: 'dart',
    transforms: {
        pxtorem: require('postcss-pxtorem')(require('../defaults/pxtorem')),
        env: require('postcss-preset-env'),
    },
    optimizations: {
        cssnano: require('cssnano'),
        // add cachebusting here
    },
    splits: {
        desktop: {
            // Lighthouse Moto G Power test device screen is 412px wide (26em × 16px)
            breakpoint: 26,
            filter: /main\.css$/,
        },
        print: {
            filter: /main\.css$/,
        }
    },
};
