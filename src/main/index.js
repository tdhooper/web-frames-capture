const saveName = require('./save-name');
const CaptureCounter = require('./capture-counter');
const { Controller } = require('./controller');
const WebSocketEmitter = require('./websocket-events');
const PostMessageEmitter = require('./postmessage-events');

const params = new URLSearchParams(window.location.search);
const url = params.get('url');
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);

const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => {
  iframe.setAttribute('src', url);
};

const wsevents = new WebSocketEmitter();

wsevents.on('close', () => {
  window.close();
});

ws.onmessage = (message) => {
  wsevents.onmessage(message.data);
};

window.addEventListener('beforeunload', (event) => {
  ws.send(JSON.stringify({
    type: 'exit',
  }));
});

const config = {};
const counter = new CaptureCounter();
const controller = new Controller(iframe, config, 'capture', counter);

controller.on('end', () => {
  ws.send(JSON.stringify({
    type: 'done',
  }));
});

const setConfig = (newConfig) => {
  if (typeof newConfig !== 'object') {
    return;
  }
  Object.assign(config, newConfig);
  controller.start();
  ws.send(JSON.stringify({
    type: 'start',
    data: config,
  }));
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

const pmevents = new PostMessageEmitter();

pmevents.on('config', setConfig);

pmevents.on('ready', () => counter.ready());

pmevents.on('rendered', (message) => {
  upload(message, saveName(config, counter))
    .then(counter.rendered.bind(counter));
});
