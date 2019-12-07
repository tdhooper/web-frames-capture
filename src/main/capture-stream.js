const { Readable } = require('stream');

const createCaptureStream = (capture, next) => new Readable({
  objectMode: true,
  read() {
    const { done, value } = next();
    if (done) {
      this.push(null);
      return;
    }
    const { frameIndex, milliseconds, quad } = value;
    capture(milliseconds, quad)
      .then((blob) => {
        this.push({ frameIndex, quad, blob });
      })
      .catch(this.destroy);
  },
});

module.exports = createCaptureStream;
