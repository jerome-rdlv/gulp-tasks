module.exports = {
	multipass: true,
	full: true,
	plugins: [
		{name: 'removeDoctype'},
		{name: 'removeComments'},
		{name: 'removeTitle'},
		{name: 'convertStyleToAttrs'},
		{name: 'convertTransform'},
		{name: 'removeHiddenElems'},
		// {name: 'removeViewBox', active: false},
		{
			name: 'cleanupIds',
			params: {
				minify: true,
				remove: true,
				preserve: ['svgo-options'],
			}
		},
		{name: 'removeStyleElement'},
		{
			name: 'cleanupNumericValues',
			params: {
				floatPrecision: 5
			}
		}
	]
};
