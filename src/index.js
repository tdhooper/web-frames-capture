/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint space-unary-ops: [2, { "overrides": {"!": true} }] */

const CaptureCounter = require('./capture-counter');
const { Controller } = require('./controller');

const params = new URLSearchParams(window.location.search);
const url = params.get('url');
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
iframe.setAttribute('src', url);

const config = {};

const captureCounter = new CaptureCounter();
const controller = new Controller(iframe, config, 'capture', captureCounter);

const setConfig = (newConfig) => {
  if (typeof newConfig !== 'object') {
    return;
  }
  Object.assign(config, newConfig);
  controller.start();
};

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
      setConfig(message);
      break;
    case 'ready':
      captureCounter.ready();
      break;
    case 'rendered':
      //save(message, configGui.config, captureCounter);
      captureCounter.rendered();
      break;
    default:
      break;
  }
};

window.addEventListener('message', receiveMessage, false);
