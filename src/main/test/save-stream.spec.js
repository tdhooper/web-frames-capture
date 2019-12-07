const assert = require('assert');
const sinon = require('sinon');
const createSaveStream = require('../save-stream');

describe('Save stream', () => {
  it('should save each blob', (done) => {
    const save = sinon.fake.returns(new Promise((resolve) => {
      resolve();
    }));
    const saveStream = createSaveStream(save, 'some-prefix-', 3, false);
    saveStream.write({ frameIndex: 0, quad: 0, blob: 'some_blob_0' });
    saveStream.write({ frameIndex: 1, quad: 0, blob: 'some_blob_1' });
    saveStream.write({ frameIndex: 2, quad: 0, blob: 'some_blob_2' });
    saveStream.end();
    saveStream.on('finish', () => {
      assert.equal(save.callCount, 3);
      assert(save.calledWith('some_blob_0', 'some-prefix-0.png'));
      assert(save.calledWith('some_blob_1', 'some-prefix-1.png'));
      assert(save.calledWith('some_blob_2', 'some-prefix-2.png'));
      done();
    });
  });

  it('should pad numbers to length of highest', (done) => {
    const save = sinon.fake.returns(new Promise((resolve) => {
      resolve();
    }));
    const saveStream = createSaveStream(save, 'some-prefix-', 11, false);
    for (let i = 0; i < 11; i++) {
      saveStream.write({ frameIndex: i, quad: 0, blob: `some_blob_${i}` });
    }
    saveStream.end();
    saveStream.on('finish', () => {
      assert.equal(save.callCount, 11);
      assert(save.calledWith('some_blob_0', 'some-prefix-00.png'));
      assert(save.calledWith('some_blob_10', 'some-prefix-10.png'));
      done();
    });
  });

  it('should not pad more than necessary', (done) => {
    const save = sinon.fake.returns(new Promise((resolve) => {
      resolve();
    }));
    const saveStream = createSaveStream(save, 'some-prefix-', 10, false);
    for (let i = 0; i < 10; i++) {
      saveStream.write({ frameIndex: i, quad: 0, blob: `some_blob_${i}` });
    }
    saveStream.end();
    saveStream.on('finish', () => {
      assert.equal(save.callCount, 10);
      assert(save.calledWith('some_blob_0', 'some-prefix-0.png'));
      assert(save.calledWith('some_blob_9', 'some-prefix-9.png'));
      done();
    });
  });

  it('should include quad in name', (done) => {
    const save = sinon.fake.returns(new Promise((resolve) => {
      resolve();
    }));
    const saveStream = createSaveStream(save, 'some-prefix-', 1, true);
    saveStream.write({ frameIndex: 0, quad: 0, blob: 'some_blob_0' });
    saveStream.write({ frameIndex: 0, quad: 1, blob: 'some_blob_1' });
    saveStream.write({ frameIndex: 0, quad: 2, blob: 'some_blob_2' });
    saveStream.write({ frameIndex: 0, quad: 3, blob: 'some_blob_3' });
    saveStream.end();
    saveStream.on('finish', () => {
      assert.equal(save.callCount, 4);
      assert(save.calledWith('some_blob_0', 'some-prefix-0_0.png'));
      assert(save.calledWith('some_blob_1', 'some-prefix-0_1.png'));
      assert(save.calledWith('some_blob_2', 'some-prefix-0_2.png'));
      assert(save.calledWith('some_blob_3', 'some-prefix-0_3.png'));
      done();
    });
  });

  it('should stop when save fails', (done) => {
    const save = sinon.fake.returns(new Promise((resolve, reject) => {
      reject(new Error('some_error'));
    }));
    const saveStream = createSaveStream(save, 'some-prefix-', 3, false);
    saveStream.write({ frameIndex: 0, quad: 0, blob: 'some_blob_0' });
    saveStream.write({ frameIndex: 1, quad: 0, blob: 'some_blob_1' });
    saveStream.write({ frameIndex: 2, quad: 0, blob: 'some_blob_2' });
    saveStream.end();
    saveStream.on('error', (error) => {
      assert.equal(error.message, 'some_error');
      assert.equal(save.callCount, 1);
      done();
    });
  });
});
