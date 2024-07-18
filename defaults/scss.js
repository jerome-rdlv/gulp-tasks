module.exports = {
    engine: 'dart',
    transforms: [
        require('autoprefixer'),
        require('postcss-pxtorem')(require('../defaults/pxtorem')),
    ],
    optimizations: [
        require('cssnano')
    ],
};
