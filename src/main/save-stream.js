const { Writable } = require('stream');
const saveName = require('./save-name');

const createSaveStream = (save, prefix, totalFrames, quads) => new Writable({
  objectMode: true,
  autoDestroy: true,
  write({ frameIndex, quad, blob }, encoding, callback) {
    const name = saveName(prefix, totalFrames, frameIndex, quads, quad);
    save(blob, name)
      .then(() => {
        callback();
      })
      .catch((error) => {
        callback(error);
      });
  },
});

module.exports = createSaveStream;
