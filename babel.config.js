module.exports = {
	presets: [
		[
			"@babel/preset-env",
			{
				modules: 'auto',
			},
		],
	],
	plugins: [
		["polyfill-corejs3", {
			method: "entry-global",
		}]
	],
};
