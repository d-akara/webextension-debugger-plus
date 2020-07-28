// import * as WebExtensions from '../../node_modules/webextension-common/src/WebExtensions'
import * as wx from 'webextension-common'
const log = wx.makeLogger('PageProxy')

try {
  log.log("loaded");
  
  wx.subscribeMessages('debugger.install', (a,b)=>{
    console.log(document.title)
    log.log('executing command')
    
    wx.content.sendMessageToPage('Message from the content script')
    return 'installed'
  })

  wx.content.executeFile('dist/debug-api.js')

  wx.content.registerPageListener(message => console.log('event received in content', message))

  wx.subscribeMessages('webextension.ping', (a,b)=>{
    console.log(document.title)
    log.log('content test relay', a, b)
    return a
  })

  wx.fetchExtensionFile('dist/page-interface.js').then(text => console.log(text))



} catch (error) {
  console.log(error)
  log.log(error)
}
