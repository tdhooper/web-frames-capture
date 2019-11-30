#!/usr/bin/env node
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint space-unary-ops: [2, { "overrides": {"!": true} }] */

const fs = require('fs');
const path = require('path');
const http = require('http');
const finalhandler = require('finalhandler');
const Router = require('router');
const html = require('simple-html-index');
const multiparty = require('multiparty');
const open = require('open');
const browserify = require('browserify');

const url = process.argv[2];
let saveLocation = process.argv[3];

if ( ! saveLocation) {
  saveLocation = fs.mkdtempSync('export-');
}

if ( ! fs.existsSync(saveLocation)) {
  console.error(`${saveLocation} does not exist`);
  process.exit(1);
}

const router = Router();

router.get('/', (request, response) => {
  html({
    title: 'Web Frames Capture',
    entry: 'index.js',
  }).pipe(response);
});

router.get('/index.js', (request, response) => {
  browserify()
    .add('src/index.js')
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
    console.log(`Saved ${filename}`);
  });

  form.parse(request);
});

router.post('/done', (request, response) => {
  response.end();
  process.exit();
});

const server = http.createServer((request, response) => {
  router(request, response, finalhandler(request, response));
});

server.on('listening', () => {
  const { port } = server.address();
  open(`http://localhost:${port}?url=${url}`);
});

server.listen();
