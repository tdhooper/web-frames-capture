# Web Frames Capture

## Usage

1. In your project:

```bash
$ npm install --save web-frames-capture
````

````javascript
const webFramesCapture = require('web-frames-capture');

var captureSetup = function(config, done) {
    // Configure your scene with config.width and config.height,
    // you'll probably want to stop animation and reset your timer
    // to 0
    done();
};

var captureTeardown = function() {
    // Restore your scene as it was before captureSetup
};

var captureRender = function(milliseconds, quad, done) {
    // Draw your scene at the given time
    // If quads is enabled, quad counts from 0 to 3 for each frame,
    // otherwise it's undefined
    done();
};

// Default config used by the UI
var captureConfig = {
  fps: 30,
  seconds: 2, // (duration)
  width: 1200,
  height: 1200,
  quad: true // optional, render each frame 4 times, for splitting a screen into quads
};

webFramesCapture(
  canvas, // The canvas element you're drawing to
  captureSetup,
  captureTeardown,
  captureRender,
  captureConfig
);

````

2. [Open the UI](https://tdhooper.github.io/web-frames-capture/build/standalone) and enter the url where your project is running
