import * as wx from 'webextension-common'
wx.background.startLogReceiver()
wx.background.startMemoryStorage()
wx.background.startMessageProxy()
const log = wx.makeLogger('Background')

try{
    log.log('loaded')

    wx.onBrowserAction(async action => {
        const window = await wx.createWindow({url:'src/webextension/Popup.html'})
        //const tab = await wx.createTab({url:'src/webextension/Popup.html'})
        
    })

    wx.listenContentLoaded(async (event:wx.EventSource)=> {
        const tab = await wx.tabFromId(event.tabId)
        log.log('loaded event: ', wx.tabInfo(tab));
    })

    wx.storage.memSet({test: 'value1'})
    log.log(wx.storage.memGet('test'))

} catch (error) {
    console.log(error)
    log.log(error)
}
  
