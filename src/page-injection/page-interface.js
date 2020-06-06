(function () {
    window.addEventListener("message", function (event) {
        if (event.source != window)
            return; // only handle if from self
        if (event.data.direction == "from-content-script") {
            console.log('event received: ', event);
            d.listPrototypes(window);
            messagePageScript('command executed');
        }
    });
    /*
    Send a message to the page script.
    */
    function messagePageScript(message) {
        var target = window.location.protocol + '//' + window.location.host;
        window.postMessage({
            direction: "from-page-script",
            message: message
        }, target);
    }
    console.log('page proxy installed');
})();
