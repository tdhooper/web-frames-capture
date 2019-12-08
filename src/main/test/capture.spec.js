const assert = require('assert');
const sinon = require('sinon');
const mockPromises = require('mock-promises');
const startCapture = require('../capture');

describe('Start capture', () => {
  let client;
  let clientSetupResolve;
  let clientSetupReject;
  let clientCaptureResolve;
  let save;
  let config;
  let capture;
  let captureReady;
  let captureFinished;
  let captureError;

  before(() => {
    Promise = mockPromises.getMockPromise(Promise);
  });

  after(() => {
    Promise = mockPromises.getOriginalPromise();
  });

  beforeEach(() => {
    mockPromises.reset();
    client = {
      setup: sinon.fake.returns(new Promise((resolve, reject) => {
        clientSetupResolve = resolve;
        clientSetupReject = reject;
      })),
      capture: sinon.fake((milliseconds, quad) => new Promise((resolve) => {
        clientCaptureResolve = () => {
          resolve(`blob_${milliseconds}_${quad}`);
        };
      })),
      teardown: sinon.fake(),
    };
    save = sinon.fake.returns(new Promise((resolve) => {
      resolve();
    }));
    config = {
      width: 640,
      height: 360,
      fps: 2,
      seconds: 1,
      prefix: 'prefix-',
    };
    captureReady = sinon.fake();
    captureFinished = sinon.fake();
    captureError = sinon.fake();
    capture = startCapture(config, client, save);
    capture.on('ready', captureReady);
    capture.on('finished', captureFinished);
    capture.on('error', captureError);
  });

  it('sets up the client', () => {
    assert(client.setup.calledWith(640, 360));
  });

  it('does not immediately call capture', () => {
    assert(client.capture.notCalled);
  });

  it('does not immediately emit the ready event', () => {
    assert(captureReady.notCalled);
  });

  describe('when setup fails', () => {
    beforeEach(() => {
      clientSetupReject('some_error');
      mockPromises.tickAllTheWay();
    });

    it('does not call capture', () => {
      assert(client.capture.notCalled);
    });

    it('errors', () => {
      assert(captureError.called);
      assert(captureError.calledWith('some_error'));
    });
  });

  describe('when setup completes', () => {
    beforeEach((done) => {
      clientSetupResolve();
      mockPromises.tick();
      setTimeout(done, 1);
    });

    it('emits the ready event', () => {
      assert(captureReady.calledOnce);
    });

    it('captures the first frame', () => {
      assert(client.capture.calledWith(0, 0));
    });

    it('does not immediately capture the next frame', (done) => {
      mockPromises.tick();
      setTimeout(() => {
        assert.equal(client.capture.calledWith(500, 0), false);
        done();
      }, 1);
    });

    it('does not teardown the client', () => {
      assert(client.teardown.notCalled);
    });

    describe('when cancelled', () => {
      beforeEach(() => {
        capture.cancel();
      });

      it('tears down the client', () => {
        assert(client.teardown.calledOnce);
      });

      describe('when first capture is complete', () => {
        beforeEach((done) => {
          clientCaptureResolve();
          mockPromises.tick();
          setTimeout(done, 1);
        });

        it('does not save the first blob', () => {
          assert(save.notCalled);
        });

        it('does not capture the next frame', () => {
          assert.equal(client.capture.calledWith(500, 0), false);
        });
      });
    });

    describe('when first capture is complete', () => {
      beforeEach((done) => {
        clientCaptureResolve();
        mockPromises.tick();
        setTimeout(done, 1);
      });

      it('saves the first blob', () => {
        assert(save.calledWith('blob_0_0', 'prefix-0.png'));
      });

      it('captures the next frame', () => {
        assert(client.capture.calledWith(500, 0));
      });

      it('does not teardown the client', () => {
        assert(client.teardown.notCalled);
      });

      describe('when last capture is complete', () => {
        beforeEach((done) => {
          clientCaptureResolve();
          mockPromises.tick();
          setTimeout(done, 1);
        });

        it('saves the last blob', () => {
          assert(save.calledWith('blob_0_0', 'prefix-0.png'));
        });

        it('tears down the client', () => {
          assert(client.teardown.calledOnce);
        });

        it('does not emit the finished event', () => {
          assert(captureFinished.notCalled);
        });

        describe('when last save is complete', () => {
          beforeEach(() => {
            mockPromises.tick();
          });

          it('emits the finished event', () => {
            assert(captureFinished.calledOnce);
          });
        });
      });
    });
  });
});
