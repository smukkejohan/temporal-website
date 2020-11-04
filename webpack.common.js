const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
//const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name]-[fullhash].js',
  },

  plugins: [
    new CleanWebpackPlugin(),

    new webpack.ProvidePlugin({
      //$: 'jquery',
    }),

    new CopyWebpackPlugin({
      patterns: [
      { from: 'static' },
      ]
    }),

    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body'
    }),

    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "css/[name]-[fullhash].css",
      chunkFilename: "[id].css"
    }),

  ],

  module: {
    rules: [
      { 
        test: /src.*\.js$/, 
        use: ['babel-loader'], 
        exclude: /(node_modules)/ 
      },
        
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          {
            loader: 'postcss-loader', // Run post css actions
            options: {
              postcssOptions: {
                plugins:
                  [
                    //require('postcss-import'),
                    require('precss'),
                    require('autoprefixer')
                  ]
              },
            }
          },
          'sass-loader'
        ]
      },

      { test: /\.html$/, loader: 'html-loader' },

      { test: /\.(png|svg|jpe?g|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: '[name]-[fullhash].[ext]',
            outputPath: 'images/'
          }
        }]
      },

      { test: /\.(ttf|eot|otf|woff2?)$/,
        use: [{
          loader: 'file-loader',
          options: {
            include: [/fonts/],
            name: "[name].[ext]",
            outputPath: 'fonts',
            publicPath: url => '../fonts/' + url
          }
        }]
      },

      /*
      { test: /\.stl$/,
        use: [{
          loader: 'file-loader',
          options: {
            limit: 8192,
            name: '3d/[name].[ext]' // -[hash] FIXME ??
          }
        }]
      },*/


       /* {
          test: /\.(glsl|vs|fs|vert|frag)$/,
          exclude: /node_modules/,
          use: [
            'raw-loader',
            'glslify-loader'
          ]
        }*/

      
    ]
  }

  
};