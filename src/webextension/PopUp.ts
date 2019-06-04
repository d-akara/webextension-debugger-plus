import * as wx from 'webextension-common'
const log = wx.makeLogger('PopUp')

log.log('Popup loaded')

try {
    wx.sendMessageActiveTab({ event: "debugger.install", content: 'message from Popup' }).then((response) => {
        log.log(response);
        const newImageHTMLElement = document.createElement("div");
        newImageHTMLElement.innerText = response as Object as string
        document.getElementsByTagName('body')[0].appendChild(newImageHTMLElement);
    });
} catch (error) {
    console.log(error)
    log.log(error.toString())
}