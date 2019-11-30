(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
(function(a,b){if("function"==typeof define&&define.amd)define([],b);else if("undefined"!=typeof exports)b();else{b(),a.FileSaver={exports:{}}.exports}})(this,function(){"use strict";function b(a,b){return"undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(b,c,d){var e=new XMLHttpRequest;e.open("GET",b),e.responseType="blob",e.onload=function(){a(e.response,c,d)},e.onerror=function(){console.error("could not download file")},e.send()}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send()}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"))}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b)}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof global&&global.global===global?global:void 0,a=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href)},4E4),setTimeout(function(){e(j)},0))}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else{var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i)})}}:function(a,b,d,e){if(e=e||open("","_blank"),e&&(e.document.title=e.document.body.innerText="downloading..."),"string"==typeof a)return c(a,b,d);var g="application/octet-stream"===a.type,h=/constructor/i.test(f.HTMLElement)||f.safari,i=/CriOS\/[\d]+/.test(navigator.userAgent);if((i||g&&h)&&"object"==typeof FileReader){var j=new FileReader;j.onloadend=function(){var a=j.result;a=i?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),e?e.location.href=a:location=a,e=null},j.readAsDataURL(a)}else{var k=f.URL||f.webkitURL,l=k.createObjectURL(a);e?e.location=l:location.href=l,e=null,setTimeout(function(){k.revokeObjectURL(l)},4E4)}});f.saveAs=a.saveAs=a,"undefined"!=typeof module&&(module.exports=a)});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){

class CaptureCounter {
  start(
    fps,
    duration,
    startFrame,
    quads,
    renderCallback,
    endCallback,
  ) {
    this.running = true;
    this.frame = startFrame;
    this.quads = quads;
    this.quad = 0;
    this.frameDuration = 1 / fps;
    this.duration = duration;
    this.totalFrames = Math.floor(fps * duration);
    this.renderCallback = renderCallback;
    this.endCallback = endCallback;
  }

  ready() {
    if (this.running) {
      this.tick();
    }
  }

  tick() {
    this.renderCallback(
      this.frame * this.frameDuration * 1000,
      this.quads ? this.quad : undefined,
    );
  }

  rendered() {
    if (this.quads && this.quad < 3) {
      this.quad += 1;
      this.tick();
      return;
    }
    this.quad = 0;
    this.frame += 1;
    if (this.frame * this.frameDuration >= this.duration) {
      this.stop();
      return;
    }
    this.tick();
  }

  stop() {
    if (this.running) {
      this.running = false;
      this.endCallback();
    }
  }
}

module.exports = CaptureCounter;

},{}],3:[function(require,module,exports){

class Controller {
  constructor(iframe, config, type, counter) {
    this.iframe = iframe;
    this.config = config;
    this.type = type;
    this.counter = counter;
  }

  start() {
    this.stopButton.removeAttribute('disabled');
    this.button.setAttribute('disabled', '');
    this.iframe.width = this.config.width;
    this.iframe.height = this.config.height;
    this.sendMessage('setup', this.config);
    this.counter.start(
      this.config.fps,
      this.config.seconds,
      this.config.start,
      this.config.quads,
      this.render.bind(this),
      this.end.bind(this),
    );
  }

  stop() {
    this.counter.stop();
  }

  render(milliseconds, quad) {
    this.sendMessage(this.type, [milliseconds, quad]);
  }

  end() {
    this.sendMessage('teardown');
    this.iframe.width = undefined;
    this.iframe.height = undefined;
  }

  sendMessage(name, message) {
    this.iframe.contentWindow.postMessage({
      webcapture: {
        name,
        message,
      },
    }, '*');
  }
}


class GUIController extends Controller {
  constructor(iframe, config, type, counter) {
    super(iframe, config, type, counter);
    this.button = document.getElementById(type);
    this.button.addEventListener('click', this.start.bind(this));
    this.stopButton = document.getElementById('stop');
    this.stopButton.addEventListener('click', this.stop.bind(this));
  }

  end() {
    super.end();
    this.stopButton.setAttribute('disabled', '');
    this.button.removeAttribute('disabled');
  }
}


module.exports = {
  Controller,
  GUIController,
};

},{}],4:[function(require,module,exports){

class PreviewCounter {
  start(fps, duration, startFrame, quads, renderCallback, endCallback) {
    this.running = true;
    this.frame = startFrame;
    this.quads = quads;
    this.frameDuration = 1 / fps;
    this.duration = duration;
    this.renderCallback = renderCallback;
    this.endCallback = endCallback;
  }

  ready() {
    if (this.running) {
      this.tick();
    }
  }

  tick() {
    this.renderCallback(
      this.frame * this.frameDuration * 1000,
      this.quads ? 0 : undefined,
    );
    this.frame += 1;
    if (this.frame * this.frameDuration >= this.duration) {
      this.frame = 0;
    }
    this.timeout = setTimeout(this.tick.bind(this), this.frameDuration * 1000);
  }

  stop() {
    if (this.running) {
      this.running = false;
      clearTimeout(this.timeout);
      this.endCallback();
    }
  }
}

module.exports = PreviewCounter;

},{}],5:[function(require,module,exports){

const inputs = document.querySelectorAll('.settings input');

const config = {};

function settingsChanged() {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const name = input.id.split('-')[0];
    let { value } = input;
    if (input.type === 'number') {
      value = parseFloat(value);
    } else if (input.type === 'checkbox') {
      value = input.checked;
    }
    config[name] = value;
  }
}

settingsChanged();

const setConfig = (newConfig) => {
  if (typeof newConfig !== 'object') {
    return;
  }
  Object.assign(config, newConfig);

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const name = input.id.split('-')[0];
    if (input.type === 'checkbox') {
      input.checked = config[name];
    } else {
      input.value = config[name];
    }
  }
};

for (let i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('change', settingsChanged.bind(this));
  inputs[i].addEventListener('blur', settingsChanged.bind(this));
}

module.exports = {
  settingsChanged,
  setConfig,
  config,
};

},{}],6:[function(require,module,exports){
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

},{"../capture-counter":2,"../controller":3,"../preview-counter":4,"./config-gui":5,"./save":7}],7:[function(require,module,exports){
const { saveAs } = require('file-saver');

const pad = (number, length) => {
  let str = `${number}`;
  while (str.length < length) {
    str = `0${str}`;
  }
  return str;
};

const save = (blob, config, counter) => {
  const { totalFrames } = counter;
  const digits = totalFrames.toString().length;
  let frameString = pad(counter.frame, digits);
  if (counter.quads) {
    frameString += `_${counter.quad}`;
  }
  const filename = `${config.prefix}${frameString}.png`;
  saveAs(blob, filename);
};

module.exports = save;

},{"file-saver":1}]},{},[6]);
