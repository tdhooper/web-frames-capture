const { createServer } = require('@jurca/post-message-rpc');
const Client = require('./main/client');

const enableCapture = (canvas, setup, teardown, render, config) => {
  const client = new Client(canvas, setup, teardown, render, config);
  createServer('web-frames-capture', [], client);
};

module.exports = enableCapture;
