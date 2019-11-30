#!/usr/bin/env node

const browserify = require('browserify');
const fs = require('fs-extra');
const path = require('path');

const target = 'standalone';
fs.removeSync(target);
fs.mkdirSync(target);
fs.copySync('src/standalone/css', path.join(target, 'css'));
fs.copySync('src/standalone/index.html', path.join(target, 'index.html'));

const js = fs.createWriteStream(path.join(target, 'index.js'));
browserify()
  .add('src/standalone/index.js')
  .bundle()
  .pipe(js);
