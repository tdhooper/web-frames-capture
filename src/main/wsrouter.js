const EventEmitter = require('events');

class WSRouter extends EventEmitter {
  onmessage(message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch(error) {
      return;
    }
    if (data.type !== undefined) {
      this.emit(data.type, data.data);
    }
  }
}

module.exports = WSRouter;
