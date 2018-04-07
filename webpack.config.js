// var path = require('path')
// var webpack = require('webpack')

// module.exports = {
//   entry: './public/vue/index.js',
//   output: {
//     path: path.resolve(__dirname, './dist'),
//     publicPath: '/public/vue/webpack',
//     filename: 'build.js'
//   },
//   mode: 'development',
//   module: {
//     rules: [
//       {
//         test: /\.css$/,
//         use: [
//           'vue-style-loader',
//           'css-loader'
//         ],
//       },      {
//         test: /\.vue$/,
//         loader: 'vue-loader',
//         options: {
//           loaders: {
//           }
//           // other vue-loader options go here
//         }
//       },
//       {
//         test: /\.js$/,
//         loader: 'babel-loader',
//         exclude: /node_modules/
//       },
//       {
//         test: /\.(png|jpg|gif|svg)$/,
//         loader: 'file-loader',
//         options: {
//           name: '[name].[ext]?[hash]'
//         }
//       }
//     ]
//   },
//   resolve: {
//     alias: {
//       'vue$': 'vue/dist/vue.esm.js'
//     },
//     extensions: ['*', '.js', '.vue', '.json']
//   },
//   devServer: {
//     historyApiFallback: true,
//     noInfo: true,
//     overlay: true
//   },
//   performance: {
//     hints: false
//   },
//   devtool: '#eval-source-map'
// }

// if (process.env.NODE_ENV === 'production') {
//   module.exports.devtool = '#source-map'
//   // http://vue-loader.vuejs.org/en/workflow/production.html
//   module.exports.plugins = (module.exports.plugins || []).concat([
//     new webpack.DefinePlugin({
//       'process.env': {
//         NODE_ENV: '"production"'
//       }
//     }),
//     new webpack.optimize.UglifyJsPlugin({
//       sourceMap: true,
//       compress: {
//         warnings: false
//       }
//     }),
//     new webpack.LoaderOptionsPlugin({
//       minimize: true
//     })
//   ])
// }


var webpack = require('webpack');
var path = require('path');

var env = process.env.WEBPACK_ENV || 'development';
var plugins = [];

module.exports = {
  entry: './src/vue/index.js',
  output: {
    path: path.resolve(__dirname, './public/vue'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  plugins,
  mode: env
};