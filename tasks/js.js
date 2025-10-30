const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const ESLintPlugin = require('eslint-webpack-plugin');
const gulp = require('gulp');
const named = require('vinyl-named');
const path = require('path');
const touch = require('../lib/touch');
const webpack = require('webpack-stream');
const {globSync} = require('glob');

module.exports = function (
	{
		paths,
		globs = [...globSync(`${paths.src}/js/**/*.js`)],
		reportFile = paths.var + '/report.html'
	}
) {

	const production = process.env.NODE_ENV === 'production';
	const absSrc = `${path.resolve(paths.src)}/`;

	const entry = globs.reduce((carry, item) => {
		const entry = (typeof item === 'object') ? item : {import: item};
		if (!/^(\/|.\/)/.test(entry.import)) {
			// make absolute
			entry.import = path.resolve(entry.import);
		}
		const name = entry.import.replace(absSrc, '');
		carry[name] = entry;
		return carry;
	}, {});

	function main(done, watch) {
		return gulp.src(Object.values(entry).map(entry => entry.import), {sourcemaps: true})
			.pipe(webpack({
				watch: !!watch,
				config: {
					entry: entry,
					output: {
						filename: '[name]',
					},
					target: 'web',
					module: {
						rules: [
							{
								test: /\.m?jsx?$/,
								exclude: /node_modules/,
								use: {
									loader: 'babel-loader',
									options: {
										exclude: 'node_modules/**',
										cacheDirectory: true,
										presets: [
											[
												"@babel/preset-env",
												{
													corejs: 3.22,
													useBuiltIns: 'entry',
													modules: 'auto',
													debug: !!process.env.DEBUG
												}
											]
										]
									}
								},
							},
							{
								test: /\.(txt|glsl|svg|css)$/i, use: 'raw-loader',
							},
						],
					},
					watchOptions: {
						ignored: '/node_modules/',
					},
					devtool: production ? 'source-map' : 'eval-cheap-module-source-map',
					mode: production ? 'production' : 'development',
					plugins: [
						new ESLintPlugin({
							configType: 'flat',
						}),
						new BundleAnalyzerPlugin({
							analyzerMode: 'static',
							reportFilename: reportFile,
							openAnalyzer: false,
						})
					],
				}
			}))
			.pipe(touch())
			.pipe(gulp.dest(paths.dist, {sourcemaps: true}))
			;
	}

	function watch(done) {
		return main(done, true);
	}

	main.displayName = 'js';
	watch.displayName = 'js:watch';

	return {main, watch}
};
