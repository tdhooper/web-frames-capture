const EventEmitter = require('events');

class PostMessageEmitter extends EventEmitter {
  constructor() {
    super();
    window.addEventListener('message', this.onmessage.bind(this), false);
  }

  onmessage(event) {
    if (typeof event.data !== 'object') {
      return;
    }
    if ('webcapture' in event.data === false) {
      return;
    }
    const { name, message } = event.data.webcapture;
    this.emit(name, message);
  }
}

module.exports = PostMessageEmitter;
