const Encore = require("@symfony/webpack-encore");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const PUBLIC_PATH = process.env.PUBLIC_PATH ?? '/';

Encore
    .setOutputPath('dist')
    .setPublicPath(PUBLIC_PATH)
    .setManifestKeyPrefix('')
    .addEntry('app', './assets/scripts/index.ts')
    .copyFiles({
        from: './assets/images',
        to: 'images/[path][name].[ext]'
    })
    .addPlugin(new HtmlWebpackPlugin({
        template: './contents/index.html.twig',
        minify: {
            collapseWhitespace: Encore.isProduction(),
            removeComments: Encore.isProduction(),
        },
    }))
    .enableSingleRuntimeChunk()
    .enableTypeScriptLoader()
    .enableSassLoader()
    .addLoader({
        test: /\.html\.twig$/,
        loader: path.resolve(__dirname, 'loaders/twig-loader.js'),
        options: {
            publicPath: PUBLIC_PATH,
        },
    })
    .configureDevServerOptions(options => {
        options.liveReload = true;
        options.hot = false;
    })
    .configureWatchOptions(watchOptions => {
        watchOptions.poll = 1000;
    })

module.exports = Encore.getWebpackConfig();
