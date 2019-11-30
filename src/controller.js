
class Controller {
  constructor(iframe, config, type, counter) {
    this.iframe = iframe;
    this.config = config;
    this.type = type;
    this.counter = counter;
  }

  start() {
    this.stopButton.removeAttribute('disabled');
    this.button.setAttribute('disabled', '');
    this.iframe.width = this.config.width;
    this.iframe.height = this.config.height;
    this.sendMessage('setup', this.config);
    this.counter.start(
      this.config.fps,
      this.config.seconds,
      this.config.start,
      this.config.quads,
      this.render.bind(this),
      this.end.bind(this),
    );
  }

  stop() {
    this.counter.stop();
  }

  render(milliseconds, quad) {
    this.sendMessage(this.type, [milliseconds, quad]);
  }

  end() {
    this.sendMessage('teardown');
    this.iframe.width = undefined;
    this.iframe.height = undefined;
  }

  sendMessage(name, message) {
    this.iframe.contentWindow.postMessage({
      webcapture: {
        name,
        message,
      },
    }, '*');
  }
}


class GUIController extends Controller {
  constructor(iframe, config, type, counter) {
    super(iframe, config, type, counter);
    this.button = document.getElementById(type);
    this.button.addEventListener('click', this.start.bind(this));
    this.stopButton = document.getElementById('stop');
    this.stopButton.addEventListener('click', this.stop.bind(this));
  }

  end() {
    super.end();
    this.stopButton.setAttribute('disabled', '');
    this.button.removeAttribute('disabled');
  }
}


module.exports = {
  Controller,
  GUIController,
};
