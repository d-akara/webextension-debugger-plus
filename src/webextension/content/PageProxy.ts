// import * as WebExtensions from '../../node_modules/webextension-common/src/WebExtensions'
import * as wx from 'webextension-common'

const log = wx.makeLogger('PageProxy')
log.log("loaded");

wx.subscribeMessages('debugger.install', (a,b)=>{
        log.log('installing debugger')
    
        const url = browser.runtime.getURL("dist/debug-api.js")
        var elt = document.createElement("script");
        elt.src = url;
        elt.type = "text/javascript";
        document.head.appendChild(elt);
        return 'installed'
})


