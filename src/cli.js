#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const finalhandler = require('finalhandler');
const Router = require('router');
const html = require('simple-html-index');
const hyperstream = require('hyperstream');
const open = require('open');
const browserify = require('browserify');

const url = process.argv[2];
const dir = process.argv[3];

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

const server = http.createServer((request, response) => {
  router(request, response, finalhandler(request, response));
});

server.on('listening', () => {
  const { port } = server.address();
  open(`http://localhost:${port}?url=${url}`);
});

server.listen();
