
var CaptureCounter = function() {};

CaptureCounter.prototype.start = function(fps, duration, renderCallback, endCallback) {
    this.running = true;
    this.frame = 0;
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
    this.renderCallback(this.frame * this.frameDuration * 1000);
};

CaptureCounter.prototype.rendered = function() {
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
