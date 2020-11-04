const { merge, mergeWithRules } = require('webpack-merge');
const path = require('path');

const common = require('./webpack.common.js');
//const Visualizer = require('webpack-visualizer-plugin');

let conf = merge(
  common, {
   mode: 'development',
   devtool: 'inline-source-map',

   output: {
    sourceMapFilename: 'js/[name].js.map',
   },

   devServer: {
    contentBase: path.join(__dirname, './dist'),
    compress: true,
    host: '0.0.0.0',
    port: 9000,
    overlay: true,
    open: 'chrome',
    bonjour: true
  },

  //plugins: [new Visualizer()]
  });

console.log(conf)

module.exports = conf