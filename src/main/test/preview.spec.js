const assert = require('assert');
const sinon = require('sinon');
const mockPromises = require('mock-promises');
const startPreview = require('../preview');

describe('Start preview', () => {
  let client;
  let clientSetupResolve;
  let clientSetupReject;
  let clientPreviewResolve;
  let save;
  let config;
  let preview;
  let previewReady;
  let previewError;
  let clock;

  before(() => {
    Promise = mockPromises.getMockPromise(Promise);
    clock = sinon.useFakeTimers();
  });

  after(() => {
    Promise = mockPromises.getOriginalPromise();
    clock.restore();
  });

  beforeEach(() => {
    mockPromises.reset();
    client = {
      setup: sinon.fake.returns(new Promise((resolve, reject) => {
        clientSetupResolve = resolve;
        clientSetupReject = reject;
      })),
      preview: sinon.fake(() => new Promise((resolve) => {
        clientPreviewResolve = resolve;
      })),
      teardown: sinon.fake(),
    };
    save = sinon.fake.returns(new Promise((resolve) => {
      resolve();
    }));
    config = {
      width: 640,
      height: 360,
      fps: 10,
      seconds: 1,
      prefix: 'prefix-',
    };
    previewReady = sinon.fake();
    previewError = sinon.fake();
    preview = startPreview(config, client, save);
    preview.on('ready', previewReady);
    preview.on('error', previewError);
  });

  afterEach(() => {
    preview.cancel && preview.cancel();
  });

  it('sets up the client', () => {
    assert(client.setup.calledWith(640, 360));
  });

  it('does not immediately call preview', () => {
    assert(client.preview.notCalled);
  });

  it('does not immediately emit the ready event', () => {
    assert(previewReady.notCalled);
  });

  describe('when setup fails', () => {
    beforeEach(() => {
      clientSetupReject('some_error');
      mockPromises.tickAllTheWay();
    });

    it('does not call preview', () => {
      assert(client.preview.notCalled);
    });

    it('errors', () => {
      assert(previewError.called);
      assert(previewError.calledWith('some_error'));
    });
  });

  describe('when setup completes', () => {
    beforeEach(() => {
      clientSetupResolve();
      mockPromises.tick();
    });

    it('emits the ready event', () => {
      assert(previewReady.calledOnce);
    });

    it('previews the first frame', () => {
      assert(client.preview.calledWith(0));
    });

    it('does not preview the next frame after the frame duration', () => {
      clock.tick(100);
      assert.equal(client.preview.calledWith(100), false);
    });

    it('does not teardown the client', () => {
      assert(client.teardown.notCalled);
    });

    describe('when first preview completes under the frame duration', () => {
      beforeEach(() => {
        clock.tick(99);
        clientPreviewResolve();
        mockPromises.tick();
      });

      it('does not immediately preview the next frame', () => {
        assert.equal(client.preview.calledWith(100), false);
      });

      it('previews the next frame after the frame duration', () => {
        clock.tick(1);
        assert.equal(client.preview.calledWith(100), true);
      });

      describe('when cancelled', () => {
        beforeEach(() => {
          preview.cancel();
        });

        it('tears down the client', () => {
          assert(client.teardown.calledOnce);
        });

        it('does not preview the next frame after the frame duration', () => {
          clock.tick(1);
          assert.equal(client.preview.calledWith(100), false);
        });
      });
    });

    describe('when first preview completes over the frame duration', () => {
      beforeEach(() => {
        clock.tick(101);
        clientPreviewResolve();
        mockPromises.tick();
      });

      it('does not immediately preview any frames', () => {
        assert.equal(client.preview.calledWith(100), false);
        assert.equal(client.preview.calledWith(200), false);
      });

      it('previews the next available frame', () => {
        clock.tick(98);
        assert.equal(client.preview.calledWith(100), false);
        assert.equal(client.preview.calledWith(200), false);
        clock.tick(1);
        assert.equal(client.preview.calledWith(100), false);
        assert.equal(client.preview.calledWith(200), true);
      });
    });
  });
});
