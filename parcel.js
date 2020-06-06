// const {FuseBox} = require('fuse-box');

// const fuse = FuseBox.init({
//     homeDir:'.',
//     output:'dist/$name.js',
//     sourceMaps: {inline: true}   
// })
// fuse.bundle("polyfills").instructions(`> node_modules/webextension-common/dist/Polyfills.js`).globals({'webextension-polyfill': 'browser'})  // polyfills and the fusebox runtime loader
// fuse.bundle("webextension-common").instructions(`+webextension-common`) // make bundle of the webextension-common module
// fuse.bundle('page-proxy').instructions(">![src/webextension/content/PageProxy.ts]").watch('src/**')
// fuse.bundle('popup').instructions(">![src/webextension/PopUp.ts]").watch('src/**')
// fuse.bundle('options').instructions(">![src/webextension/options/Options.ts]").watch('src/**')
// fuse.bundle('devtools').instructions(">![src/webextension/devtools/Devtools.ts]").watch('src/**')
// fuse.bundle('devtools-panel').instructions(">![src/webextension/devtools/devtools-panel.ts]").watch('src/**')
// fuse.bundle('background').instructions(">![src/webextension/background/Background.ts]").watch('src/**')

// fuse.run()

const Path = require('path');
const Bundler = require('parcel-bundler');

const entryFiles = Path.join(__dirname, './index.html');


// Bundler options
const options = {
  outDir: './dist', // The out directory to put the build files in, defaults to dist
  watch: true, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
  target: 'browser', // Browser/node/electron, defaults to browser
  bundleNodeModules: false, // By default, package.json dependencies are not included when using 'node' or 'electron' with 'target' option above. Set to true to adds them to the bundle, false by default
};

(async function() {
  // Initializes a bundler using the entrypoint location and options provided
  await new Bundler('src/webextension/devtools/devtools-panel.ts', options).bundle();
  new Bundler('src/webextension/content/PageProxy.ts', options).bundle();


    
})();