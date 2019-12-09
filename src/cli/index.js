const { initClient } = require('../client/rpc');
const startCapture = require('../main/capture');
const WebSocketEmitter = require('./websocket-events');

const params = new URLSearchParams(window.location.search);
const url = params.get('url');

const upload = (blob, name) => {
  const form = new FormData();
  form.append('image', blob, name);
  const f = fetch('/save', {
    method: 'POST',
    body: form,
  });
  return f.then(response => response.text());
};

const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => {
  initClient(url).then((client) => {
    client.config().then((config) => {
      const capture = startCapture(config, client, upload);
      capture.on('finished', () => {
        ws.send(JSON.stringify({
          type: 'done',
        }));
      });
      capture.on('ready', () => {
        ws.send(JSON.stringify({
          type: 'start',
          data: config,
        }));
      });
      // on error close (or report error?)
    });
  });

  const wsevents = new WebSocketEmitter();

  wsevents.on('close', () => {
    window.close();
  });

  ws.onmessage = (message) => {
    wsevents.onmessage(message.data);
  };

  window.addEventListener('beforeunload', () => {
    ws.send(JSON.stringify({
      type: 'exit',
    }));
  });
};
