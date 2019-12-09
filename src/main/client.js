
class Client {
  constructor(canvas, setup, teardown, render, config) {
    this.canvas = canvas;
    this._setup = setup;
    this._teardown = teardown;
    this._render = render;
    this._config = config;
  }

  config() {
    return this._config;
  }

  setup(width, height) {
    return new Promise((resolve) => {
      this._setup(width, height, resolve);
    });
  }

  teardown() {
    this._teardown();
  }

  capture(milliseconds, quad) {
    return new Promise((resolve) => {
      this._render(milliseconds, quad, () => {
        this.canvasToBlob().then(resolve);
      });
    });
  }

  preview(milliseconds) {
    return new Promise((resolve) => {
      this._render(milliseconds, 0, () => resolve());
    });
  }

  canvasToBlob() {
    // from https://github.com/mattdesl/canvas-sketch/blob/master/lib/save.js#L60
    const dataURL = this.canvas.toDataURL();
    return new Promise((resolve) => {
      const splitIndex = dataURL.indexOf(',');
      if (splitIndex === -1) {
        resolve(new window.Blob());
        return;
      }
      const base64 = dataURL.slice(splitIndex + 1);
      const byteString = window.atob(base64);
      const type = dataURL.slice(0, splitIndex);
      const mimeMatch = /data:([^;]+)/.exec(type);
      const mime = (mimeMatch ? mimeMatch[1] : '') || undefined;
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      resolve(new window.Blob([ ab ], { type: mime }));
    });
  }
}

module.exports = Client;
