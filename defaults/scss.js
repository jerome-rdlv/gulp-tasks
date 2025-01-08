module.exports = {
    engine: 'dart',
    transforms: [
        require('postcss-pxtorem')(require('../defaults/pxtorem')),
        require('postcss-preset-env'),
    ],
    optimizations: [
        require('cssnano')
    ],
};
