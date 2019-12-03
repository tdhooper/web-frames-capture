
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
