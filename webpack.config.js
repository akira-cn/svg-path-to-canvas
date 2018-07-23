const path = require('path')
const fs = require('fs')

let babelConf
if(fs.existsSync('./.babelrc')) {
  // use babel
  babelConf = JSON.parse(fs.readFileSync('.babelrc'))
}


module.exports = function (env = {}) {
  let externals = {}
  const output = {
    path: path.resolve(__dirname, 'dist'),
    filename: 'svg-path-to-canvas.js',
    publicPath: '/js/',
    library: 'SvgPath',
    libraryTarget: 'umd',
  }

  if(env.production) {
    output.filename = 'svg-path-to-canvas.min.js'
  }

  if(env.module) {
    output.filename = 'svg-path-to-canvas.module.js'
    externals = ['sprite-math', /^babel-runtime/]
    output.libraryTarget = 'commonjs2'
  }

  return {
    mode: env.production ? 'production' : 'none',
    entry: './src/index',
    output,

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: babelConf,
          },
        },
      ],

      /* Advanced module configuration (click to show) */
    },

    externals,
    // Don't follow/bundle these modules, but request them at runtime from the environment

    stats: 'errors-only',
    // lets you precisely control what bundle information gets displayed

    devServer: {
      contentBase: path.join(__dirname, 'example'),
      compress: true,
      port: 9090,
      // ...
    },

    plugins: [
      // ...
    ],
    // list of additional plugins


    /* Advanced configuration (click to show) */
  }
}
