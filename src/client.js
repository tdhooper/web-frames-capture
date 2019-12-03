
class WebCaptureClient {
  consructor(canvas, setup, teardown, render, config) {
    if (window.top === window) {
      return;
    }
    this.canvas = canvas;
    this.setup = setup;
    this.teardown = teardown;
    this.render = render;
    window.addEventListener('message', this.receiveMessage.bind(this), false);
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

  receiveMessage(event) {
    if (typeof event.data != 'object') {
      return;
    }
    if ( ! event.data.hasOwnProperty('webcapture')) {
      return;
    }
    const { name, message } = event.data.webcapture;
    switch (name) {
      case 'setup':
        this.setup(message, this.ready.bind(this));
        break;
      case 'teardown':
        this.teardown();
        break;
      case 'preview':
        this.render(message[0], message[1]);
        break;
      case 'capture':
        this.render(message[0], message[1], this.sendImageData.bind(this));
        break;
      default:
        break;
    }
  }
}

module.exports = WebCaptureClient;
