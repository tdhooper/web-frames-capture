/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint space-unary-ops: [2, { "overrides": {"!": true} }] */

const saveName = require('./save-name');
const CaptureCounter = require('./capture-counter');
const { Controller } = require('./controller');

const params = new URLSearchParams(window.location.search);
const url = params.get('url');
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
iframe.setAttribute('src', url);

const config = {};

const counter = new CaptureCounter();
const controller = new Controller(iframe, config, 'capture', counter);

let stopped = false;

controller.on('end', () => {
  fetch('/done', { method: 'POST' })
    .then(() => {
      stopped = true;
      window.close();
    });
});

window.addEventListener('beforeunload', (event) => {
  event.preventDefault();
  event.returnValue = '';
  fetch('/done', { method: 'POST' })
    .then(() => {
      stopped = true;
      window.close();
    });
});

const setConfig = (newConfig) => {
  if (typeof newConfig !== 'object') {
    return;
  }
  Object.assign(config, newConfig);
  controller.start();
  fetch('/start', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(newConfig),
  });
};

const upload = (blob, name) => {
  const form = new FormData();
  form.append('image', blob, name);
  const f = fetch('/save', {
    method: 'POST',
    body: form,
  });
  return f.then(response => response.text());
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
      counter.ready();
      break;
    case 'rendered':
      upload(message, saveName(config, counter))
        .then(counter.rendered.bind(counter));
      break;
    default:
      break;
  }
};

window.addEventListener('message', receiveMessage, false);
