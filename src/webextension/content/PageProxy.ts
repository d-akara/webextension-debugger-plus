// import * as WebExtensions from '../../node_modules/webextension-common/src/WebExtensions'
import * as wx from 'webextension-common'
const log = wx.makeLogger('PageProxy')

try {
  log.log("loaded");
  
  wx.subscribeMessages('debugger.install', (a,b)=>{
    log.log('executing command')

    const target = window.location.protocol + '//' + window.location.host
    window.postMessage({
        direction: "from-content-script",
        message: "Message from the content script"
      }, target);
    return 'installed'
  })

  wx.content.executeFile('dist/page-interface.js')
  wx.content.executeFile('dist/debug-api.js')

  window.addEventListener("message", (event) => {
    if (event.source != window) return  // only handle if from self
    if (event.data.direction == "from-page-script") {
        console.log('event received in content: ', event)
    }
  });

} catch (error) {
  log.log(error)
}
