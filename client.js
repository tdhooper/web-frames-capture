
var WebCaptureClient = function(canvas, setup, teardown, render, config) {
    if (window.top == window) {
        return;
    }
    this.canvas = canvas;
    this.setup = setup;
    this.teardown = teardown;
    this.render = render;
    window.addEventListener('message', this.receiveMessage.bind(this), false);
    this.sendMessage('config', config);
};

WebCaptureClient.prototype.sendImageData = function() {
    this.canvas.toBlob(function(blob) {
        this.sendMessage('rendered', blob);
    }.bind(this));
};

WebCaptureClient.prototype.ready = function() {
    this.sendMessage('ready');
};

WebCaptureClient.prototype.sendMessage = function(name, message) {
    window.top.postMessage({
        webcapture: {
            name: name,
            message: message
        }
    }, '*');
};

WebCaptureClient.prototype.receiveMessage = function(event) {
    if (typeof event.data != 'object') {
        return;
    }
    if ( ! event.data.hasOwnProperty('webcapture')) {
        return;
    }
    var name = event.data.webcapture.name;
    var message = event.data.webcapture.message;
    switch (name) {
        case 'setup':
            this.setup(message);
            setTimeout(this.ready.bind(this), 100);
            break;
        case 'teardown':
            this.teardown();
            break;
        case 'preview':
            this.render(message);
            break;
        case 'capture':
            this.render(message);
            this.sendImageData();
            break;
    }
};

module.exports = WebCaptureClient;
