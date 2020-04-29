const { createServer, createClient } = require('@jurca/post-message-rpc');
const Client = require('./client');

const initServer = (canvas, setup, teardown, render, config) => {
  const client = new Client(canvas, setup, teardown, render, config);
  createServer('web-frames-capture', [], client);
};

const initClient = async (url, iframe) => {
  if ( ! iframe) {
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
  }
  return new Promise((resolve) => {
    iframe.addEventListener('load', () => {
      const client = createClient(
        iframe.contentWindow,
        {
          channel: 'web-frames-capture',
          timeout: 30000,
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
    });
    iframe.setAttribute('src', url);
  });
};

module.exports = {
  initClient,
  initServer,
};
