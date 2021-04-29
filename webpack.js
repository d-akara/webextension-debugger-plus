var webpack = require('webpack');

const options_default = {
    mode: 'development',
    watch: true,
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true
                    }
                }
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader']
            }
        ]
    },
    // plugins: [
    //     {
    //         apply(compiler) {
    //             console.dir(compiler.options)
    //         }
    //     }
    // ]
    // externals: {
    //     'webextension-common': 'webextension-common'
    // }
}

const options_optimization = {
    optimization: {
        runtimeChunk: {
            name: 'webpack-runtime' // create one bundle with webpack runtime code
        }
    }
}
webpack([
    { ...options_default, ...options_optimization, 
        entry: {
        'polyfills': {import: './node_modules/webextension-common/dist/Polyfills.js'},
        'webextension-common':  {import: 'webextension-common' },
        'main': { import: './src/main.ts'},
    },
    output: { filename: '[name].js' } },
], (err, stats) => { // Stats Object
  if (err)
    process.stdout.write(err + '\n');
  if (stats)
    process.stdout.write(stats.toString() + '\n');
})

webpack([
    { ...options_default, 
        devtool: 'inline-source-map',
        mode: 'development',
        entry: {
        'debug-api': {import: './src/page-injection/debug-api.ts'}
    },
    output: { filename: '[name].js' } },
], (err, stats) => { // Stats Object
  if (err)
    process.stdout.write(err + '\n');
  if (stats)
    process.stdout.write(stats.toString() + '\n');
})