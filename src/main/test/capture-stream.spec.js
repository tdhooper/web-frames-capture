const assert = require('assert');
const Counter = require('../counter');
const createCaptureStream = require('../capture-stream');

describe('Capture stream', () => {
  it('should capture for every frame', (done) => {
    const counter = new Counter(4, 1);
    const capture = milliseconds => new Promise((resolve) => {
      resolve(`some_blob_${milliseconds}`);
    });
    const captureStream = createCaptureStream(capture, () => counter.next());
    const values = [
      { frameIndex: 0, quad: 0, blob: 'some_blob_0' },
      { frameIndex: 1, quad: 0, blob: 'some_blob_250' },
      { frameIndex: 2, quad: 0, blob: 'some_blob_500' },
      { frameIndex: 3, quad: 0, blob: 'some_blob_750' },
    ];
    captureStream.on('data', (data) => {
      assert.deepStrictEqual(data, values.shift());
    });
    captureStream.on('end', () => {
      done();
    });
  });

  it('should capture for every frame and quad', (done) => {
    const counter = new Counter(2, 1, { quads: true });
    const capture = milliseconds => new Promise((resolve) => {
      resolve(`some_blob_${milliseconds}`);
    });
    const captureStream = createCaptureStream(capture, () => counter.next());
    const values = [
      { frameIndex: 0, quad: 0, blob: 'some_blob_0' },
      { frameIndex: 0, quad: 1, blob: 'some_blob_0' },
      { frameIndex: 0, quad: 2, blob: 'some_blob_0' },
      { frameIndex: 0, quad: 3, blob: 'some_blob_0' },
      { frameIndex: 1, quad: 0, blob: 'some_blob_500' },
      { frameIndex: 1, quad: 1, blob: 'some_blob_500' },
      { frameIndex: 1, quad: 2, blob: 'some_blob_500' },
      { frameIndex: 1, quad: 3, blob: 'some_blob_500' },
    ];
    captureStream.on('data', (data) => {
      assert.deepStrictEqual(data, values.shift());
    });
    captureStream.on('end', () => {
      done();
    });
  });

  it('should stop for errors', (done) => {
    const counter = new Counter(4, 1);
    const capture = () => new Promise((resolve, reject) => {
      reject(new Error('some_error'));
    });
    const captureStream = createCaptureStream(capture, () => counter.next());
    captureStream.on('error', (error) => {
      assert.equal(error.message, 'some_error');
      done();
    });
    captureStream.on('data', () => {});
  });
});
