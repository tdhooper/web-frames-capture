
var CaptureCounter = function() {};

CaptureCounter.prototype.start = function(
    fps,
    duration,
    startFrame,
    quads,
    renderCallback,
    endCallback
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
};

CaptureCounter.prototype.ready = function() {
    if (this.running) {
        this.tick();
    }
};

CaptureCounter.prototype.tick = function() {
    this.renderCallback(
        this.frame * this.frameDuration * 1000,
        this.quads ? this.quad : undefined
    );
};

CaptureCounter.prototype.rendered = function() {
    console.log(this.quad);
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
};

CaptureCounter.prototype.stop = function() {
    if (this.running) {
        this.running = false;
        this.endCallback();
    }
};
