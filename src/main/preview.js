const EventEmitter = require('events');
const Counter = require('./counter');

const startPreview = (config, client) => {
  const {
    width,
    height,
    fps,
    seconds,
    startFrame,
  } = config;

  const emitter = new EventEmitter();

  client.setup(width, height)
    .then(() => {
      emitter.emit('ready');

      const counter = new Counter(fps, seconds, startFrame, false, true);

      let timeout;
      let lastComplete = true;
      const loop = () => {
        const { milliseconds } = counter.next().value;
        timeout = setTimeout(loop, counter.frameDuration * 1000);
        if (lastComplete) {
          client.preview(milliseconds).then(() => {
            lastComplete = true;
          });
        }
        lastComplete = false;
      };
      loop();

      emitter.cancel = () => {
        clearTimeout(timeout);
        client.teardown();
      };
    })
    .catch((error) => {
      emitter.emit('error', error);
    });

  return emitter;
};

module.exports = startPreview;
