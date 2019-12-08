const EventEmitter = require('events');
const Counter = require('./counter');
const createCaptureStream = require('./capture-stream');
const createSaveStream = require('./save-stream');

const startCapture = (config, client, save) => {
  const {
    width,
    height,
    fps,
    seconds,
    startFrame,
    quads,
    prefix,
  } = config;

  const emitter = new EventEmitter();

  client.setup(width, height)
    .then(() => {
      emitter.emit('ready');

      const counter = new Counter(fps, seconds, startFrame, quads);
      const captureStream = createCaptureStream(
        client.capture.bind(client),
        counter.next.bind(counter),
      );
      const saveStream = createSaveStream(save, prefix, counter.totalFrames, quads);
      const stream = captureStream.pipe(saveStream);

      captureStream.on('end', () => {
        client.teardown();
      });

      saveStream.on('finish', () => {
        emitter.emit('finished');
      });

      stream.on('error', (error) => {
        emitter.emit('error', error);
      });

      emitter.cancel = () => {
        captureStream.destroy();
        client.teardown();
      };
    })
    .catch((error) => {
      emitter.emit('error', error);
    });

  return emitter;
};

module.exports = startCapture;
