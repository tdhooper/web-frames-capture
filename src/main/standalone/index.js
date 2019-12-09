const { saveAs } = require('file-saver');
const configGui = require('./config-gui');
const initClient = require('../rpc-client');
const startCapture = require('../capture');

const urlInput = document.getElementById('url-input');
const params = new URLSearchParams(window.location.search);
const url = params.get('url');
urlInput.value = url;

const iframe = document.getElementById('target-iframe');

const save = (blob, name) => new Promise((resolve) => {
  saveAs(blob, name);
  resolve();
});

initClient(url, iframe).then((client) => {
  let capture;
  const startButton = document.getElementById('capture');
  const stopButton = document.getElementById('stop');

  const start = () => {
    startButton.setAttribute('disabled', '');
    capture = startCapture(configGui.config, client, save);
    capture.on('ready', () => {
      stopButton.removeAttribute('disabled');
    });
    capture.on('finished', () => {
      startButton.removeAttribute('disabled');
      stopButton.setAttribute('disabled', '');
    });
  };

  const stop = () => {
    capture.cancel();
    stopButton.setAttribute('disabled', '');
    startButton.removeAttribute('disabled');
  };

  startButton.addEventListener('click', start);
  stopButton.addEventListener('click', stop);

  client.config().then((config) => {
    configGui.setConfig(config);
    startButton.removeAttribute('disabled');
  });
});
