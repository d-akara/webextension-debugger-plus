import * as wx from 'webextension-common'
const log = wx.makeLogger('Options')

log.log('Options loaded')

try {
    wx.storage.memGet('count').then(value => {
        log.log(value);
        const newImageHTMLElement = document.createElement("div");
        newImageHTMLElement.innerText = value as Object as string
        document.getElementsByTagName('body')[0].appendChild(newImageHTMLElement);
    }).catch(reason => {
        log.log(JSON.stringify(reason))
    });

    wx.sendMessageTabs({}, { event: "popup.event", content: 'message from options' }).then(response => {
        response.filter( r => !r.isError ).forEach( r => log.log('promise all response', r))
    }).catch(reason => {
        log.log('handle error', JSON.stringify(reason))
    });

    wx.sendMessageExtensionPages({ event: "webextension.ping", content: 'ping from devtools' }).then(response => log.log(response));
    wx.subscribeMessages('webextension.ping', event => 'ping response Options')
} catch (error) {
    console.log(error)
    log.log(JSON.stringify(error))
}