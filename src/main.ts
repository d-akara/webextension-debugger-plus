import * as wx from 'webextension-common'
import { h, text, app } from "hyperapp"
import {css,styled, setup} from 'goober'
import {prefix} from 'goober-autoprefixer'
declare var window:any;

wx.initModule({
    id: 'background',
    page: wx.PageType.background,
    onInit: log => {
        browser.browserAction.setPopup({popup:wx.extensionUrl('src/webextension/hitch.html?page=action')})
        browser.browserAction.setIcon({path:wx.extensionUrl('icons/chevron-double-up.png')})
        browser.browserAction.setTitle({title:'Devtools Debugger Plus'});
    
        // wx.onBrowserAction(async event => {
        //     console.log('action', event)
        //     event.action.setPopup({popup:wx.extensionUrl('src/webextension/browser-action/Popup.html')})
        //     event.action.openPopup()
        //     //const window = await wx.createWindow({url:'src/webextension/Popup.html', type:"popup"})
        //     //const tab = await wx.createTab({url:'src/webextension/Popup.html'})
        // });
    
        // wx.listenContentLoaded(async (event:wx.EventSource)=> {
        //     const tab = await wx.tabFromId(event.tabId)
        //     log.log('loaded event: ', wx.tabInfo(tab));
        // });
    
        (async function() {
            await wx.storage.memSet({test: 'value1'})
            const result = await wx.storage.memGet('test')
            log.log(result)
        })()
   } 
})

wx.initModule({
    id:'popup action',
    page: wx.PageType.action,
    onInit: (log)=> {
        log.log('location', window.location.pathname)
        
        window.addEventListener('load', (event) => {
            webApp()
        });
        
        setup(null, prefix)
        const backgroundCSS = css`
        user-select: none;
        `;  
        
        const effectFn = (fn, props) => [fn, props]
        
        function webApp() {
            const NewValue = (state, event) => {
                return [
                    {...state,
                        enabled: event.target.checked
                    },
                    effectFn(
                        (dispatch, props) => {
                            wx.sendMessageActiveTab({event:'debug.install'})
                        },
                        {}   
                    )
                ]
            }
        
            app({
                init: { enabled: false},
                view: ({ enabled }) =>
                    h("main", {}, [
                        h('h2', {class: backgroundCSS, style: {display:'grid', "place-items": 'center center'}},[
                            h('i', {class: 'settings icon'}),
                            h('div', {class: ''}, [text('Web Debugger Plus'), h('div', {class: "sub header"}, text('Improved debugging'))])
                        ]),   
                        h('div', {style: {display:'grid', "grid-template-columns": 'auto auto', "gap": "15px 10px"}}, [
                            h('div', {class:''}, [h("input", {type: "checkbox", name:'enable', onclick: NewValue})]),
                            h("label", {}, text("Enable: " + enabled)),
                        ]),
                    ]),
                node: document.getElementById("app"),
            })
        }
    }
})

wx.initModule({
    id: 'content',
    page: wx.PageType.content,
    onInit: log => {
        let debugInstalled = false

        wx.subscribeMessages('debug.install', () => {
          if (!debugInstalled)
            wx.content.executeFile('dist/debug-api.js')
          debugInstalled = true
        })
      
        wx.content.subscribePageMessages('debug.installed', message => {
          wx.sendMessageToPage({event:'debug-hooks.installConsole'})
        })      
   } 
})

wx.initModule({
    id: 'devtools',
    page: wx.PageType.devtools,
    onInit: log => {
        wx.devtools.createPanel("Devtools WebExtension", "/icons/access-point-network.png", "/src/webextension/hitch.html?page=devtools-panel")

        wx.sendMessageActiveTab({ event: "webextension.ping", content: 'ping(5) message from Devtols' }).then((response) => {
            log.log('test.relay response received')
            log.log(response);
            const newImageHTMLElement = document.createElement("div");
            newImageHTMLElement.innerText = response as Object as string
            document.getElementsByTagName('body')[0].appendChild(newImageHTMLElement);
        });
    
        wx.subscribeMessages('webextension.ping', event => 'ping(0) response Devtools')    
   } 
})

wx.initModule({
    id: 'devtools-panel',
    page: wx.PageType.devtoolsPanel,
    onInit: log => {
        wx.sendMessageExtensionPages({ event: "webextension.ping", content: 'ping(4) from Devtols Panel' }).then((response) => {
            log.log(response);
            const newImageHTMLElement = document.createElement("div");
            newImageHTMLElement.innerText = response as Object as string
            document.getElementsByTagName('body')[0].appendChild(newImageHTMLElement);
        });
    
        wx.subscribeMessages('webextension.ping', event => 'ping(1) response devtools-panel')
        wx.sendMessageActiveTab({ event: "webextension.ping", content: 'ping(2) from devtools' }).then(response => log.log(response));
        wx.sendMessageExtensionPages({ event: "webextension.ping", content: 'ping(3) from devtools' }).then(response => log.log(response));
   } 
})

wx.initModule({
    id: 'options',
    page: wx.PageType.options,
    onInit: log => {
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
   } 
})
