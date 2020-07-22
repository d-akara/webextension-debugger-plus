var webpack = require('webpack');

const options_default = {
    mode: 'development',
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
// fuse.bundle("polyfills").instructions(`> node_modules/webextension-common/dist/Polyfills.js`).globals({'webextension-polyfill': 'browser'})  // polyfills and the fusebox runtime loader
webpack([
    //   { ...options_default, ...options_optimization, entry: './node_modules/webextension-common/dist/Polyfills.js',   output: { filename: 'polyfills-[name].js' } },
    
    { ...options_default, ...options_optimization, 
        entry: {
        'polyfills': {import: './node_modules/webextension-common/dist/Polyfills.js'},
        'webextension-common':  {import: 'webextension-common' },
        'page-proxy': { import: './src/webextension/content/PageProxy.ts', dependOn: 'webextension-common'},
        'popup': { import: './src/webextension/PopUp.ts', dependOn: 'webextension-common'},
        'options': { import: './src/webextension/options/Options.ts', dependOn: 'webextension-common'},
        'devtools': { import: './src/webextension/devtools/Devtools.ts', dependOn: 'webextension-common'},
        'background': { import: './src/webextension/background/Background.ts', dependOn: 'webextension-common'},
        'devtools-panel': { import: './src/webextension/devtools/devtools-panel.ts', dependOn: 'webextension-common'},
    },
    output: { filename: '[name].js' } },
], (err, stats) => { // Stats Object
  if (err)
    process.stdout.write(err + '\n');
  if (stats)
    process.stdout.write(stats.toString() + '\n');
})