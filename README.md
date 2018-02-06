# Web Frames Capture

## Usage

1. In your project:

```bash
$ npm install --save web-frames-capture
````

````javascript
const WebCaptureClient = require('web-frames-capture');

var captureSetup = function(config) {
    // Configure your scene with config.width and config.height,
    // you'll probably want to stop animation and reset your timer
    // to 0
};

var captureTeardown = function() {
    // Restore your scene as it was before captureSetup
};

var captureRender = function(milliseconds) {
    // Draw your scene at the given time
};

// Default config used by the UI
var captureConfig = {
  fps: 30,
  seconds: 2, // (duration)
  width: 1200,
  height: 1200
};

var webCapture = new WebCaptureClient(
  canvas, // The canvas element you're drawing to
  captureSetup,
  captureTeardown,
  captureRender,
  captureConfig
);

````

2. Open the UI and enter the url where your project is running
