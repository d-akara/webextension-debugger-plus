import * as wx from 'webextension-common'
import { h, text, app } from "hyperapp"
import {css,styled, setup} from 'goober'
import {prefix} from 'goober-autoprefixer'

const log = wx.makeLogger('PopUp')
wx.setLogger(log)

log.log('Popup loaded')

declare var window:any;
try {
    wx.subscribeMessages(wx.EVENT_ID_TAB_CREATE, event => {
        log.log('received', event)
    })

    window.addEventListener('load', (event) => {
        webApp()
    });

} catch (error) {
    console.log(error)
    log.log(error.toString())
}

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