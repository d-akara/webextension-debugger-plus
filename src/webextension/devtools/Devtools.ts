import * as wx from 'webextension-common'
const log = wx.makeLogger('Devtools')

log.log('Devtools loaded')
try {
    wx.devtools.createPanel("Devtools WebExtension", "/icons/access-point-network.png", "/src/webextension/devtools/devtools-panel.html")

    wx.sendMessageActiveTab({ event: "webextension.ping", content: 'ping(5) message from Devtols' }).then((response) => {
        log.log('test.relay response received')
        log.log(response);
        const newImageHTMLElement = document.createElement("div");
        newImageHTMLElement.innerText = response as Object as string
        document.getElementsByTagName('body')[0].appendChild(newImageHTMLElement);
    });

    wx.subscribeMessages('webextension.ping', event => 'ping(0) response Devtools')
} catch (error) {
    console.log(error)
    log.log(error.toString())
}