#!/usr/bin/env node
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint space-unary-ops: [2, { "overrides": {"!": true} }] */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const finalhandler = require('finalhandler');
const Router = require('router');
const html = require('simple-html-index');
const multiparty = require('multiparty');
const bodyParser = require('body-parser');
const open = require('open');
const browserify = require('browserify');
const cliProgress = require('cli-progress');

const url = process.argv[2];
let saveLocation = process.argv[3];

if ( ! saveLocation) {
  saveLocation = fs.mkdtempSync('export-');
}

if ( ! fs.existsSync(saveLocation)) {
  console.error(`${saveLocation} does not exist`);
  process.exit(1);
}

const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  const handlers = {};

  handlers.start = (config) => {
    progress.start(config.fps * config.seconds, 0);
  };

  handlers.done = () => {
    progress.stop();
    ws.send(JSON.stringify({type: 'close'}));
    process.exit();
  };

  handlers.exit = () => {
    progress.stop();
    process.exit();
  };

  process.on('SIGINT', () => {
    ws.send(JSON.stringify({type: 'close'}));
    console.log(''); // exit on a new line
    process.exit();
  });

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch(error) {
      return;
    }
    const handler = handlers[data.type];
    if (handler) {
      handler(data.data);
    }
  });
});

const router = Router();

router.get('/', (request, response) => {
  html({
    title: 'Web Frames Capture',
    entry: 'index.js',
  }).pipe(response);
});

router.get('/index.js', (request, response) => {
  const scriptDir = path.dirname(require.main.filename);
  browserify()
    .add(path.join(scriptDir, 'index.js'))
    .bundle()
    .pipe(response);
});

router.post('/save', (request, response) => {
  const form = new multiparty.Form({
    autoFiles: true,
  });

  form.on('file', (name, file) => {
    const filename = path.join(saveLocation, file.originalFilename);
    fs.renameSync(file.path, filename);
    response.end(file.originalFilename);
    progress.increment();
  });

  form.parse(request);
});

const jsonParser = bodyParser.json();

const server = http.createServer((request, response) => {
  jsonParser(request, response, () => {
    router(request, response, finalhandler(request, response));
  });
});

server.on('listening', () => {
  const { port } = server.address();
  open(`http://localhost:${port}?url=${url}`);
});

server.listen();
