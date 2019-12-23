const { createServer, createClient } = require('@jurca/post-message-rpc');
const Client = require('./client');

const initServer = (canvas, setup, teardown, render, config) => {
  const client = new Client(canvas, setup, teardown, render, config);
  createServer('web-frames-capture', [], client);
};

const initClient = async (url) => {
  return new Promise((resolve) => {
    const button = document.createElement('button');
    button.textContent = 'Start';
    document.body.appendChild(button);
    button.addEventListener('click', () => {
      const page = window.open(url);
      setTimeout(() => {
        const client = createClient(
          page,
          {
            channel: 'web-frames-capture',
          },
          {
            config: null,
            setup: null,
            teardown: null,
            capture: null,
            preview: null,
          },
        );
        resolve(client);
      }, 3000);
    });
  });
};

module.exports = {
  initClient,
  initServer,
};
