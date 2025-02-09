const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const ESLintPlugin = require('eslint-webpack-plugin');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const named = require('vinyl-named');
const touch = require('../lib/touch');
const terser = require('gulp-terser');
const webpack = require('webpack-stream');

module.exports = function ({globs, base, dist}) {

    const webpackConfig = {
        target: 'web',
        module: {
            rules: [
                // {
                //     enforce: 'pre',
                //     test: /\.m?jsx?$/,
                //     exclude: /node_modules/,
                //     loader: 'eslint-loader',
                //     options: {
                //         failOnError: false,
                //         failOnWarning: false,
                //     }
                // },
                {
                    test: /\.m?jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader', options: {
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
                    test: /\.(txt|glsl|svg)$/i, use: 'raw-loader',
                },
            ],
        },
        watchOptions: {
            ignored: '/node_modules/',
        },
        devtool: process.env.NODE_ENV === 'production' ? false : 'eval',
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
        output: {
            filename: '[name].js'
        },
        plugins: [
            new ESLintPlugin({
                configType: 'flat',
            }),
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: dist + '/report.html',
                openAnalyzer: false,
            })
        ],
        // watch: true,
    };

    function main(cb, watch) {
        return gulp.src(globs, {
            base: base,
            sourcemaps: true,
        })
            .pipe(named(function (file) {
                // chunk name
                return file.relative.substring(0, file.relative.length - file.extname.length);
            }))
            .pipe(webpack({
                watch: !!watch,
                config: webpackConfig,
            }))
            .pipe(gulpif(process.env.NODE_ENV === 'production', terser()))
            .pipe(touch())
            .pipe(gulp.dest(dist, {sourcemaps: true}))
            ;
    }

    function watch(cb) {
        return main(cb, true);
    }

    main.displayName = 'js';
    watch.displayName = 'js:watch';

    return {main, watch, webpackConfig};
};
