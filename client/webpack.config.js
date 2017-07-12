const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: ['./index.js', './styles/index.scss'],
  output: {
    path: path.resolve('dist'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract('css-loader!sass-loader') }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'index.html', filename: 'index.html', inject: 'body' }),
    new ExtractTextPlugin('./styles/index.css', { allChunks: true }),
  ]
};
