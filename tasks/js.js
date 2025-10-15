const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const ESLintPlugin = require('eslint-webpack-plugin');
const gulp = require('gulp');
const named = require('vinyl-named');
const path = require('path');
const touch = require('../lib/touch');
const webpack = require('webpack-stream');

module.exports = function (paths, globs) {

	const production = process.env.NODE_ENV === 'production';

	const entry = globs.reduce((carry, item) => {
		const entry = (typeof item === 'object') ? item : {import: item};
		if (!/^(\/|.\/)/.test(entry.import)) {
			// add explicit relative path
			entry.import = `./${entry.import}`;
		}
		const name = entry.import.replace(`${paths.src}/js/`, '').replace(/.js$/, '');
		carry[name] = entry;
		return carry;
	}, {});

	function main(done, watch) {
		return gulp.src(Object.values(entry).map(entry => entry.import), {
			base: paths.src,
			sourcemaps: true,
		})
			.pipe(webpack({
				watch: !!watch,
				config: {
					entry: entry,
					output: {
						filename: 'js/[name].js',
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
							reportFilename: paths.dist + '/report.html',
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
