/**
  * Copyright (C) 2016 tieba.baidu.com
  * webpack.config.js
  *
  * changelog
  * 2016-04-17[17:32:59]:revised
  *
  * @author yanni4night@gmail.com
  * @version 1.0.0
  * @since 1.0.0
  */

const webpack = require('webpack');
const dateFormat = require('dateformat');

const env = process.env.NODE_ENV;

const isDev = env === 'development';

const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf-8'));

const now = new Date();
const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss Z');

const startYear = 2015;
const endYear = now.getFullYear()

const config = {
    node:{
        fs: 'empty'
    },
    eslint: {
        configFile: '.eslintrc'
    },
    entry: {
        main: "./src/ssi.js",
    },
    output: {
        path: __dirname,
        filename: "ssi.dist.js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ['babel-loader', 'eslint-loader'],
            exclude: /node_modules/
        }]
    },
    plugins: [
        new webpack.BannerPlugin('/*! ssi.js ' + (isDev ? 'Development' : 'Release') + ' v' + pkg.version +
            ' Build ' + timestamp + ' | (C) 2015~' + endYear +
            ' yanni4night.com | github.com/yanni4night/node-ssi | MIT */', {
                raw: true,
                entryOnly: true
            })
    ]
};

if (!isDev) {
    config.plugins.unshift(new webpack.optimize.UglifyJsPlugin({
        comments: /@important/,
        compressor: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            screw_ie8: true,
            warnings: false
        }
    }));
}
module.exports = config;