import * as wx from 'webextension-common'
wx.background.startLogReceiver()
wx.background.startMemoryStorage()
wx.background.startMessageProxy()
const log = wx.makeLogger('Background')

try{
    log.log('loaded')
    browser.browserAction.setPopup({popup:wx.extensionUrl('src/webextension/browser-action/Popup.html')})
    browser.browserAction.setIcon({path:wx.extensionUrl('icons/chevron-double-up.png')})
    browser.browserAction.setTitle({title:'Devtools Debugger Plus'});

    // wx.onBrowserAction(async event => {
    //     console.log('action', event)
    //     event.action.setPopup({popup:wx.extensionUrl('src/webextension/browser-action/Popup.html')})
    //     event.action.openPopup()
    //     //const window = await wx.createWindow({url:'src/webextension/Popup.html', type:"popup"})
    //     //const tab = await wx.createTab({url:'src/webextension/Popup.html'})
        
    // });

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
  
