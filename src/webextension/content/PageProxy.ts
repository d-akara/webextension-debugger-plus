// import * as WebExtensions from '../../node_modules/webextension-common/src/WebExtensions'
import * as wx from 'webextension-common'

const log = wx.makeLogger('PageProxy')
log.log("loaded");

wx.subscribeMessages('debugger.install', (a,b)=>{
    log.log('executing command')
    window.postMessage({
        direction: "from-content-script",
        message: "Message from the content script"
      }, '*');
    return 'installed'
})

wx.content.executeFile('dist/page-interface.js')
wx.content.executeFile('dist/debug-api.js')
