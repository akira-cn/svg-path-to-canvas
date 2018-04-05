// const conf = require('./package.json')

module.exports = function (env = {}) {
  const webpack = require('webpack'),
    path = require('path'),
    fs = require('fs')

  const proxyPort = 9091,
    plugins = [],
    jsLoaders = []

  let externals = {}

  if(env.production) {
    // compress js in production environment

    plugins.push(new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false, // remove all comments
      },
      compress: {
        warnings: false,
        drop_console: false,
      },
    }))
  }

  const output = {
    filename: 'svg-path-to-canvas.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/js/',
    library: 'SvgPath',
    libraryTarget: 'umd',
  }

  if(env.production) {
    output.filename = 'svg-path-to-canvas.min.js'
  } else if(env.module) {
    output.filename = 'svg-path-to-canvas.module.js'
    externals = {
      'sprite-math': 'sprite-math'
    }
    output.libraryTarget = 'commonjs2'
  }

  if(fs.existsSync('./.babelrc')) {
    // use babel
    const babelConf = JSON.parse(fs.readFileSync('.babelrc'))
    jsLoaders.push({
      loader: 'babel-loader',
      options: babelConf,
    })
  }

  return {
    entry: './src/index.js',
    output,

    plugins,

    module: {
      rules: [{
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: jsLoaders,
      }],
    },
    externals,

    devServer: {
      open: true,
      proxy: {
        '*': `http://127.0.0.1:${proxyPort}`,
      },
    },
    // devtool: 'inline-source-map',
  }
}
