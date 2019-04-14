
var PreviewCounter = function() {};

PreviewCounter.prototype.start = function(fps, duration, quads, renderCallback, endCallback) {
    this.running = true;
    this.frame = 0;
    this.quads = quads;
    this.frameDuration = 1 / fps;
    this.duration = duration;
    this.renderCallback = renderCallback;
    this.endCallback = endCallback;
};

PreviewCounter.prototype.ready = function() {
    if (this.running) {
        this.tick();
    }
};

PreviewCounter.prototype.tick = function() {
    this.renderCallback(
        this.frame * this.frameDuration * 1000,
        this.quads ? 0 : undefined
    );
    this.frame += 1;
    if (this.frame * this.frameDuration >= this.duration) {
        this.frame = 0;
    }
    this.timeout = setTimeout(this.tick.bind(this), this.frameDuration * 1000);
};

PreviewCounter.prototype.stop = function() {
    if (this.running) {
        this.running = false;
        clearTimeout(this.timeout);
        this.endCallback();
    }
};
