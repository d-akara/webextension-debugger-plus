import * as wx from 'webextension-common'
const log = wx.makeLogger('Options')

log.log('Options loaded')

try {
    wx.storage.memGet('test').then(value => {
        log.log(value);
        const newImageHTMLElement = document.createElement("div");
        newImageHTMLElement.innerText = value as Object as string
        document.getElementsByTagName('body')[0].appendChild(newImageHTMLElement);
    }).catch(reason => {
        log.log(JSON.stringify(reason))
    });


    wx.sendMessageExtensionPages({ event: "webextension.ping", content: 'ping from options' }).then(response => log.log(response));
    wx.subscribeMessages('test.ping', event => log.log(event.content))
} catch (error) {
    console.log(error)
    log.log(JSON.stringify(error))
}