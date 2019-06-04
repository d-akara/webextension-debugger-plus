const {FuseBox} = require('fuse-box');

const fuse = FuseBox.init({
    homeDir:'.',
    output:'dist/$name.js',
    sourceMaps: {inline: true}   
})
fuse.bundle("polyfills").instructions(`> node_modules/webextension-common/dist/Polyfills.js`).globals({'webextension-polyfill': 'browser'})  // polyfills and the fusebox runtime loader
fuse.bundle("webextension-common").instructions(`+webextension-common`) // make bundle of the webextension-common module
fuse.bundle('page-proxy').instructions(">![src/webextension/content/PageProxy.ts]").watch('src/**')
fuse.bundle('popup').instructions(">![src/webextension/PopUp.ts]").watch('src/**')
fuse.bundle('options').instructions(">![src/webextension/options/Options.ts]").watch('src/**')
fuse.bundle('devtools').instructions(">![src/webextension/devtools/Devtools.ts]").watch('src/**')
fuse.bundle('devtools-panel').instructions(">![src/webextension/devtools/devtools-panel.ts]").watch('src/**')
fuse.bundle('background').instructions(">![src/webextension/background/Background.ts]").watch('src/**')

fuse.run()