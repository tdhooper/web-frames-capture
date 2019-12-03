/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint space-unary-ops: [2, { "overrides": {"!": true} }] */

const { saveAs } = require('file-saver');
const CaptureCounter = require('../capture-counter');
const PreviewCounter = require('../preview-counter');
const { GUIController } = require('../controller');
const configGui = require('./config-gui');
const saveName = require('../save-name');
const PostMessageEmitter = require('../postmessage-events');

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

const pmevents = new PostMessageEmitter();

pmevents.on('config', configGui.setConfig);

pmevents.on('ready', captureCounter.ready);
pmevents.on('ready', previewCounter.ready);

pmevents.on('rendered', (message) => {
  saveAs(message, saveName(configGui.config, captureCounter));
  captureCounter.rendered();
});
