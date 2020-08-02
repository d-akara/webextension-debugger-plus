import * as wx from 'webextension-common'
const log = wx.makeLogger('PopUp')
wx.setLogger(log)

log.log('Popup loaded')

try {

    wx.sendMessageActiveTab({event:'debug.install'})

    wx.subscribeMessages('webextension.tab.create', event => {
        log.log(event)
    })

} catch (error) {
    console.log(error)
    log.log(error.toString())
}