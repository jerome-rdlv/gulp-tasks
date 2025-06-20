const gulp = require('gulp');
const named = require('vinyl-named');
const webpack = require('webpack-stream');
const ESLintPlugin = require('eslint-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const touch = require('../lib/touch');

module.exports = function (paths, globs) {

	const production = process.env.NODE_ENV === 'production';

	function main(done, watch) {
		return gulp.src(globs, {
			base: paths.src,
			sourcemaps: true,
		})
			.pipe(named(function (file) {
				// chunk name
				return file.relative.substring(0, file.relative.length - file.extname.length);
			}))
			.pipe(webpack({
				watch: !!watch,
				config: {
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
					devtool: production ? false : 'eval',
					mode: production ? 'production' : 'development',
					output: {
						filename: '[name].js'
					},
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
