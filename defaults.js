/**
 * @see node_modules/gulpfile/defaults.js for possible options
 * Some options can be overriden by CLI arguments:
 *  - --url=http://example.org
 *  - --production or --prod
 *
 *  url option accepts an array
 */
module.exports = {
    url: null,
    srcDir: 'src',
    varDir: 'var',
    distDir: 'assets',
    assetsDir: '',
    cacheBust: 'path',
    production: false,
    tasks: {
        browsersync: true,
        // exclude from cleaning
        cleanex: [],
        // static assets to copy
        copy: [
            'font/*.{woff,woff2}',
        ],
        img: true,
        js: [], // script entrypoints
        jsil: [], // inline scripts
        scss: {
            autoprefixer: [],
            cssnano: {
                autoprefixer: false,
                zindex: false
            },
            // because block editor can not transform compressed CSS
            nonano: ['editor.css'],
            pxtorem: {
                rootValue: 10,
                propList: ['*'],
                selectorBlackList: [],
                replace: true,
                mediaQuery: false,
                // should be kept above 0 because 0px is needed for custom-properties to work
                minPixelValue: 1,
            },
            split: {
                urlPrefix: 'ts',
                minRatio: .85,
                ranges: [
                    [0, 26],
                    [26, 75],
                    [75],
                ]
            },
        },
        svg: true,
        symlink: [], // symlink
        template: [], // templates
        thumb: false // thumbnail file
    }
};