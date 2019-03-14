const merge = require('webpack-merge');
const common = require('./webpack.common.js');
//const Visualizer = require('webpack-visualizer-plugin');

module.exports = merge.smartStrategy({
  'module.rules.use': 'prepend'
})(common, {
   mode: 'development',
   devtool: 'inline-source-map',

   devServer: {
    contentBase: './dist',
    compress: true,
    port: 9000,
  },

  //plugins: [new Visualizer()],

  module: {
    rules: [   
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: 'style-loader',
          },
        ]
      }
    ]
  }

});