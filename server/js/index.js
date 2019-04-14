
/* CONFIG */

var inputs = document.querySelectorAll('.settings input');
for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('change', settingsChanged.bind(this));
    inputs[i].addEventListener('blur', settingsChanged.bind(this));
}

var config = {};

settingsChanged();

function settingsChanged() {
    for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        var name = input.id.split('-')[0];
        var value = input.value;
        if (input.type == 'number') {
            value = parseFloat(value);
        } else if (input.type == 'checkbox') {
            value = input.checked;
        }
        config[name] = value;
    }
}

var setConfig = function(newConfig) {
    if (typeof newConfig !== 'object') {
        return;
    }
    Object.assign(config, newConfig);

    for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        var name = input.id.split('-')[0];
        if (input.type == 'checkbox') {
            input.checked = config[name];
        } else {
            input.value = config[name];
        }
    }
};


/* URL*/

var params = new URLSearchParams(window.location.search);
var url = params.get('url');

var urlInput = document.getElementById('url-input');
urlInput.value = url;

var iframe = document.getElementById('target-iframe');

if (url) {
    iframe.setAttribute('src', urlInput.value);
}


/*

var startCapture = function() {
    sendMessage('setup', config);
    captureCounter.start(config, captureFrame, endCapture);
};

var captureFrame = function(milliseconds) {
    return new Promise((resolve, reject) => {
        sendMessage('capture', milliseconds);
        onMessageOnce('captureData', data => {
            save(data);
            resolve();
        })
    });
};

var endCapture = function() {
    sendMessage('teardown');
};

*/

/* BOTH */


var Controller = function(type, counter) {
    this.type = type;
    this.counter = counter;
    this.button = document.getElementById(type);
    this.button.addEventListener('click', this.start.bind(this));
    this.stopButton = document.getElementById('stop');
    this.stopButton.addEventListener('click', this.stop.bind(this));
};

Controller.prototype.start = function() {
    this.stopButton.removeAttribute('disabled');
    this.button.setAttribute('disabled', '');
    iframe.width = config.width;
    iframe.height = config.height;
    sendMessage('setup', config);
    this.counter.start(
        config.fps,
        config.seconds,
        config.quads,
        this.render.bind(this),
        this.end.bind(this)
    );
};

Controller.prototype.stop = function() {
    this.counter.stop();
};

Controller.prototype.render = function(milliseconds, quad) {
    sendMessage(this.type, [milliseconds, quad]);
};

Controller.prototype.end = function() {
    sendMessage('teardown');
    this.stopButton.setAttribute('disabled', '');
    this.button.removeAttribute('disabled');
    iframe.width = undefined;
    iframe.height = undefined;
};

var previewCounter = new PreviewCounter();
var captureCounter = new CaptureCounter();

var previewController = new Controller('preview', previewCounter);
var captureController = new Controller('capture', captureCounter);


/* SAVING */

var save = function(blob) {
    var totalFrames = captureCounter.totalFrames;
    var digits = totalFrames.toString().length;
    var frameString = pad(captureCounter.frame, digits);
    if (captureCounter.quads) {
        frameString += '_' + captureCounter.quad;
    }
    var filename = config.prefix + frameString + '.png';
    saveAs(blob, filename);
};

var pad = function(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
};

/* MESSAGING */

var sendMessage = function(name, message) {
    iframe.contentWindow.postMessage({
        webcapture: {
            name: name,
            message: message
        }
    }, '*');
};

var receiveMessage = function(event) {
    if (typeof event.data != 'object') {
        return;
    }
    if ( ! event.data.hasOwnProperty('webcapture')) {
        return;
    }
    var name = event.data.webcapture.name;
    var message = event.data.webcapture.message;
    switch (name) {
        case 'config':
            setConfig(message);
            break;
        case 'ready':
            captureCounter.ready();
            previewCounter.ready();
            break;
        case 'rendered':
            save(message);
            captureCounter.rendered();
            break;
    }
};

window.addEventListener('message', this.receiveMessage, false);


/*

on init set size
on width height change, update size

on click preview
    call webCaptureSetup({width, height, fps, duration})
    call webCaptureFrame(time)
    call webCaptureTeardown

while previewing
fps/seconds change animation

*/