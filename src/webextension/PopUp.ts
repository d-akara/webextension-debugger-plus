import * as wx from 'webextension-common'
const log = wx.makeLogger('PopUp')
wx.setLogger(log)

log.log('Popup loaded')

declare var window:any;
try {
    wx.sendMessageActiveTab({event:'debug.install'})

    wx.subscribeMessages(wx.EVENT_ID_TAB_CREATE, event => {
        log.log('received', event)
    })

} catch (error) {
    console.log(error)
    log.log(error.toString())
}