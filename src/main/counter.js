
class Counter {
  constructor(fps, duration, startFrame, quads) {
    this.quads = quads;
    this.frameDuration = 1 / fps;
    this.duration = duration;
    this.totalFrames = Math.floor(fps * duration);
    this.frameIndex = startFrame || 0;
    this.milliseconds = 0;
    this.quad = 0;
    this.first = true;
  }

  done() {
    if (this.frameIndex === this.totalFrames - 1) {
      if (this.quads) {
        return this.quad === 3;
      }
      return true;
    }
    return false;
  }

  next() {
    if (this.done()) {
      return { done: true };
    }
    if (this.quads && this.quad < 3) {
      if ( ! this.first) {
        this.quad += 1;
      }
    } else {
      if ( ! this.first) {
        this.frameIndex += 1;
      }
      this.quad = 0;
    }
    this.milliseconds = this.frameIndex * this.frameDuration * 1000;
    this.first = false;
    return {
      done: this.done(),
      value: {
        frameIndex: this.frameIndex,
        milliseconds: this.milliseconds,
        quad: this.quad,
      },
    };
  }
}

module.exports = Counter;
