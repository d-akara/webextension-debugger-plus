import * as wx from 'webextension-common'
const log = wx.makeLogger('devtools-panel')

try {
    log.log('loaded')
    wx.sendMessageExtensionPages({ event: "webextension.ping", content: 'ping(4) from Devtols Panel' }).then((response) => {
        log.log(response);
        const newImageHTMLElement = document.createElement("div");
        newImageHTMLElement.innerText = response as Object as string
        document.getElementsByTagName('body')[0].appendChild(newImageHTMLElement);
    });

    wx.subscribeMessages('webextension.ping', event => 'ping(1) response devtools-panel')
    wx.sendMessageActiveTab({ event: "webextension.ping", content: 'ping(2) from devtools' }).then(response => log.log(response));
    wx.sendMessageExtensionPages({ event: "webextension.ping", content: 'ping(3) from devtools' }).then(response => log.log(response));

} catch (error) {
    console.log(error)
    log.log(error.toString())
}