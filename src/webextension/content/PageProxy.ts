// import * as WebExtensions from '../../node_modules/webextension-common/src/WebExtensions'
import * as wx from 'webextension-common'
const log = wx.makeLogger('PageProxy')

try {
  log.log("loaded");
  let debugInstalled = false

  wx.subscribeMessages('debug.install', () => {
    if (!debugInstalled)
      wx.content.executeFile('dist/debug-api.js')
    debugInstalled = true
  })

  wx.content.subscribePageMessages('debug.installed', message => {
    console.log('event received in content', message)
    wx.sendMessageToPage({event:'signal'})
  })
  

} catch (error) {
  console.log(error)
  log.log(error)
}
