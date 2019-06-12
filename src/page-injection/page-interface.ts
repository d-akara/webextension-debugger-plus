declare var d:any

(function () {
    window.addEventListener("message", (event) => {
        if (event.source != window) return  // only handle if from self
        if (event.data.direction == "from-content-script") {
            console.log('event received: ', event)
            d.listPrototypes(window)
        }
    });

    /*
    Send a message to the page script.
    */
    function messagePageScript() {
        window.postMessage({
            direction: "from-content-script",
            message: "Message from the content script"
        }, "https://mdn.github.io");
    }

    console.log('page proxy installed')
})()