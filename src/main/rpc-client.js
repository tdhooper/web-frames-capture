const { createClient } = require('@jurca/post-message-rpc');

const initClient = async (url) => {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  iframe.setAttribute('src', url);
  return createClient(
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
};

module.exports = initClient;
