module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                corejs: "3.37",
                // https://babeljs.io/docs/babel-preset-env#usebuiltins
                useBuiltIns: "entry",
                modules: 'auto',
            },
        ],
    ]
};