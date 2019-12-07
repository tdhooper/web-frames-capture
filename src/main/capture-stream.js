const { Readable } = require('stream');

const createCaptureStream = (capture, next) => new Readable({
  objectMode: true,
  autoDestroy: true,
  read() {
    const { value } = next();
    if (value === undefined) {
      this.push(null);
      return;
    }
    const { frameIndex, milliseconds, quad } = value;
    capture(milliseconds, quad)
      .then((blob) => {
        this.push({ frameIndex, quad, blob });
      })
      .catch((error) => {
        this.destroy(error);
      });
  },
});

module.exports = createCaptureStream;
