const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js',
    sourceMapFilename: 'js/[name].js.map',

  },
  module: {

    
    rules: [
      { 
        test: /src.*\.js$/, 
        use: ['babel-loader'], 
        exclude: /(node_modules|bower_components)/ 
      },
        
      {
        test: /\.(scss)$/,
        use: [{
          loader: 'style-loader', // inject CSS to page
        }, {
          loader: 'css-loader', // translates CSS into CommonJS modules
        }, {
          loader: 'postcss-loader', // Run post css actions
          options: {
            plugins: function () { // post css plugins, can be exported to postcss.config.js
              return [
                require('precss'),
                require('autoprefixer')
              ];
            }
          }
        }, {
          loader: 'sass-loader' // compiles Sass to CSS
        }]
      },

      { test: /\.html$/, loader: 'html-loader' },

      {
        test: /\.(png|svg|jpe?g|gif|ttf|eot|otf|woff2?)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
      
    ]
  },
  plugins: [
    new ExtractTextPlugin('css/bundle.css'),

    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body'
    })

  ],

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  }
  
};