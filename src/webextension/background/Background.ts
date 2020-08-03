import * as wx from 'webextension-common'
wx.background.startLogReceiver()
wx.background.startMemoryStorage()
wx.background.startMessageProxy()
const log = wx.makeLogger('Background')

try{
    log.log('loaded')

    wx.onBrowserAction(async action => {
        const window = await wx.createWindow({url:'src/webextension/Popup.html', type:"popup"})
        console.log('created window', window)
        //const tab = await wx.createTab({url:'src/webextension/Popup.html'})
        
    });

    // wx.listenContentLoaded(async (event:wx.EventSource)=> {
    //     const tab = await wx.tabFromId(event.tabId)
    //     log.log('loaded event: ', wx.tabInfo(tab));
    // });

    (async function() {
        await wx.storage.memSet({test: 'value1'})
        const result = await wx.storage.memGet('test')
        log.log(result)
    })()

} catch (error) {
    console.log(error)
    log.log(error)
}
  
