const PostMessageEmitter = require('./main/postmessage-events');

class WebCaptureClient extends PostMessageEmitter {
  constructor(canvas, setup, teardown, render, config) {
    super();

    if (window.top === window) {
      return;
    }

    this.canvas = canvas;
    this.setup = setup;
    this.teardown = teardown;
    this.render = render;

    this.on('setup', (message) => {
      this.setup(message, this.ready.bind(this));
    });
    this.on('teardown', this.teardown);
    this.on('preview', (message) => {
      this.render(message[0], message[1]);
    });
    this.on('capture', (message) => {
      this.render(message[0], message[1], this.sendImageData.bind(this));
    });

    this.sendMessage('config', config);
  }

  sendImageData() {
    this.canvasToBlob().then((blob) => {
      this.sendMessage('rendered', blob);
    });
  }

  ready() {
    this.sendMessage('ready');
  }

  sendMessage(name, message) {
    window.top.postMessage({
      webcapture: { name, message },
    }, '*');
  }

  canvasToBlob() {
    // from https://github.com/mattdesl/canvas-sketch/blob/master/lib/save.js#L60
    const dataURL = this.canvas.toDataURL();
    return new Promise((resolve) => {
      const splitIndex = dataURL.indexOf(',');
      if (splitIndex === -1) {
        resolve(new window.Blob());
        return;
      }
      const base64 = dataURL.slice(splitIndex + 1);
      const byteString = window.atob(base64);
      const type = dataURL.slice(0, splitIndex);
      const mimeMatch = /data:([^;]+)/.exec(type);
      const mime = (mimeMatch ? mimeMatch[1] : '') || undefined;
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      resolve(new window.Blob([ ab ], { type: mime }));
    });
  }
}

module.exports = WebCaptureClient;
