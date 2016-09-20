var webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

var webpackConfig = {
    entry: __dirname + '/src/app.js',
    output: {
        path: __dirname + '/build/',
        filename: '[name].bundle.js'
    },

    devtool: 'source-map',
    node: {
        fs: 'empty'
    },

    module: {
        loaders: [
            {test: /\.css$/, loader: ExtractTextPlugin.extract(
                'style',
                'css!autoprefixer'
            )},
            {test: /\.sass$/, loader: ExtractTextPlugin.extract(
                'style',
                'css!autoprefixer!sass'
            )},
            {test: /\.gif$/, loader: 'url?limit=10000&mimetype=image/gif'},
            {test: /\.jpg$/, loader: 'url?limit=10000&mimetype=image/jpg'},
            {test: /\.png$/, loader: 'url?limit=10000&mimetype=image/png'},
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=application/font-woff'
            }, {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=application/font-woff'
            }, {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=application/octet-stream'
            }, {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file'
            }, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=image/svg+xml'
            },
            {test: /\.js$/, loader: 'babel', exclude: [/node_modules/]},
            {test: /\.json$/, loader: 'json'},
            {test: /\.pug$/, loader: 'pug'}
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            minify: false
        }),
        new ExtractTextPlugin('styles.css')
    ]
};

module.exports = webpackConfig;
