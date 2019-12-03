
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
