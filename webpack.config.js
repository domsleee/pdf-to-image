var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: __dirname,
  entry: {
    'main': './src/js/main.js',
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry'
  },
  mode: 'none',
  output: {
    path: path.join(__dirname, './dist/js'),
    publicPath: './dist/js',
    filename: '[name].bundle.js'
  },
  watch: true,
  module: {
    rules: [
    {
      test: /\.css$/,
      use: [
        { loader: "style-loader" },
        { loader: "css-loader" }
      ]
    }]
  }
};