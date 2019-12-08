const { createClient } = require('@jurca/post-message-rpc');

const initClient = async (url) => {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  return new Promise((resolve) => {
    iframe.addEventListener('load', () => {
      const client = createClient(
        iframe.contentWindow,
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
    });
    iframe.setAttribute('src', url);
  });
};

module.exports = initClient;
