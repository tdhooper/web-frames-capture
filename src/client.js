const PostMessageEmitter = require('./main/postmessage-events');

class WebCaptureClient extends PostMessageEmitter {
  consructor(canvas, setup, teardown, render, config) {
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
    this.canvas.toBlob((blob) => {
      this.sendMessage('rendered', blob);
    });
  }

  ready() {
    this.sendMessage('ready');
  }

  static sendMessage(name, message) {
    window.top.postMessage({
      webcapture: { name, message },
    }, '*');
  }
}

module.exports = WebCaptureClient;
