const { saveAs } = require('file-saver');
const configGui = require('./config-gui');
const { initClient } = require('../client/rpc');
const startCapture = require('../main/capture');
const startPreview = require('../main/preview');

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
  let preview;
  const captureButton = document.getElementById('capture');
  const previewButton = document.getElementById('preview');
  const stopButton = document.getElementById('stop');

  const captureHandler = () => {
    captureButton.setAttribute('disabled', '');
    previewButton.setAttribute('disabled', '');
    capture = startCapture(configGui.config, client, save);
    capture.on('ready', () => {
      stopButton.removeAttribute('disabled');
    });
    capture.on('finished', () => {
      captureButton.removeAttribute('disabled');
      previewButton.removeAttribute('disabled');
      stopButton.setAttribute('disabled', '');
    });
  };

  const previewHandler = () => {
    captureButton.setAttribute('disabled', '');
    previewButton.setAttribute('disabled', '');
    preview = startPreview(configGui.config, client);
    preview.on('ready', () => {
      stopButton.removeAttribute('disabled');
    });
  };

  const stopHandler = () => {
    capture && capture.cancel();
    preview && preview.cancel();
    stopButton.setAttribute('disabled', '');
    captureButton.removeAttribute('disabled');
    previewButton.removeAttribute('disabled');
  };

  captureButton.addEventListener('click', captureHandler);
  previewButton.addEventListener('click', previewHandler);
  stopButton.addEventListener('click', stopHandler);

  client.config().then((config) => {
    configGui.setConfig(config);
    captureButton.removeAttribute('disabled');
    previewButton.removeAttribute('disabled');
  });
});
