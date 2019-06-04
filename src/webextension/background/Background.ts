import * as wx from 'webextension-common'
wx.background.startLogReceiver()
wx.background.startMemoryStorage()
wx.background.startMessageProxy()
const log = wx.makeLogger('Background')

log.log('loaded')

// wx.subscribeMessages('debugger.install', (a,b)=>{
//     log.log('installing debugger')

//     const url = browser.runtime.getURL("dist/debug-api.js")
//     var elt = document.createElement("script");
//     elt.innerHTML = "window.foo = {bar:function(){/*whatever*/}};"
//     document.head.appendChild(elt);
//     return 'installed'
// })

wx.onBrowserAction(action => {
    wx.createWindow('src/webextension/Popup.html')
})

wx.listenContentLoaded((event:wx.EventSource)=> {
    log.log('loaded event: ',event);
})

wx.storage.memSet({test: 'value1'})
log.log(wx.storage.memGet('test'))
