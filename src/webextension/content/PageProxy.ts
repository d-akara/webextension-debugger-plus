// import * as WebExtensions from '../../node_modules/webextension-common/src/WebExtensions'
import * as wx from 'webextension-common'

const log = wx.makeLogger('PageProxy')
log.log("loaded");

wx.subscribeMessages('debugger.install', (a,b)=>{
    log.log('installing debugger')
    
    wx.content.executeFile('dist/debug-api.js')
    return 'installed'
})

log.log('running inline script')
// if (!wx.content.executeScript('console.log("I ran at start")'))
//     log.log('no head element')

wx.content.executeFile('dist/debug-api.js')
