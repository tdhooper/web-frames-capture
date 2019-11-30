/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint space-unary-ops: [2, { "overrides": {"!": true} }] */

const CaptureCounter = require('../capture-counter');
const PreviewCounter = require('../preview-counter');
const { GUIController } = require('../controller');
const configGui = require('./config-gui');
const save = require('./save');

const urlInput = document.getElementById('url-input');
const params = new URLSearchParams(window.location.search);
const url = params.get('url');
urlInput.value = url;

const iframe = document.getElementById('target-iframe');
if (url) {
  iframe.setAttribute('src', urlInput.value);
}

const previewCounter = new PreviewCounter();
const captureCounter = new CaptureCounter();

new GUIController(iframe, configGui.config, 'preview', previewCounter);
new GUIController(iframe, configGui.config, 'capture', captureCounter);

const receiveMessage = (event) => {
  if (typeof event.data !== 'object') {
    return;
  }
  if ( ! event.data.hasOwnProperty('webcapture')) {
    return;
  }
  const { name, message } = event.data.webcapture;
  switch (name) {
    case 'config':
      configGui.setConfig(message);
      break;
    case 'ready':
      captureCounter.ready();
      previewCounter.ready();
      break;
    case 'rendered':
      save(message, configGui.config, captureCounter);
      captureCounter.rendered();
      break;
    default:
      break;
  }
};

window.addEventListener('message', receiveMessage, false);
