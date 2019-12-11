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
      const counter = new Counter(fps, seconds, { startFrame, loop: true });

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

      emitter.pause = () => {
        clearTimeout(timeout);
        timeout = undefined;
      };

      emitter.unpause = () => {
        if (timeout === undefined) {
          loop();
        }
      };

      emitter.emit('ready');
    })
    .catch((error) => {
      emitter.emit('error', error);
    });

  return emitter;
};

module.exports = startPreview;
