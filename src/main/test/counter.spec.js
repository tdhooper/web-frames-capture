const assert = require('assert');
const Counter = require('../counter');

describe('Counter', () => {
  it('should iterate through all frames', () => {
    const counter = new Counter(4, 1);
    const values = [
      { frameIndex: 0, milliseconds: 0, quad: 0 },
      { frameIndex: 1, milliseconds: 250, quad: 0 },
      { frameIndex: 2, milliseconds: 500, quad: 0 },
      { frameIndex: 3, milliseconds: 750, quad: 0 },
    ];
    let done = false;
    while ( ! done) {
      const result = counter.next();
      assert.deepStrictEqual(result.value, values.shift());
      done = result.done;
    }
    assert.equal(values.length, 0);
    assert.deepStrictEqual(counter.next(), { done: true });
  });

  it('should iterate through all frames endlessly when looping is enabled', () => {
    const counter = new Counter(4, 1, 0, false, true);
    const values = [
      { frameIndex: 0, milliseconds: 0, quad: 0 },
      { frameIndex: 1, milliseconds: 250, quad: 0 },
      { frameIndex: 2, milliseconds: 500, quad: 0 },
      { frameIndex: 3, milliseconds: 750, quad: 0 },
    ];
    let i = 0;
    while (i < 1000) {
      const result = counter.next();
      assert.deepStrictEqual(result.value, values[i % values.length]);
      assert.equal(result.done, false);
      i++;
    }
  });

  it('should iterate through all frames and quads', () => {
    const counter = new Counter(2, 1, 0, true);
    const values = [
      { frameIndex: 0, milliseconds: 0, quad: 0 },
      { frameIndex: 0, milliseconds: 0, quad: 1 },
      { frameIndex: 0, milliseconds: 0, quad: 2 },
      { frameIndex: 0, milliseconds: 0, quad: 3 },
      { frameIndex: 1, milliseconds: 500, quad: 0 },
      { frameIndex: 1, milliseconds: 500, quad: 1 },
      { frameIndex: 1, milliseconds: 500, quad: 2 },
      { frameIndex: 1, milliseconds: 500, quad: 3 },
    ];
    let done = false;
    while ( ! done) {
      const result = counter.next();
      assert.deepStrictEqual(result.value, values.shift());
      done = result.done;
    }
    assert.equal(values.length, 0);
    assert.deepStrictEqual(counter.next(), { done: true });
  });

  it('should iterate from start frame', () => {
    const counter = new Counter(4, 1, 2);
    const values = [
      { frameIndex: 2, milliseconds: 500, quad: 0 },
      { frameIndex: 3, milliseconds: 750, quad: 0 },
    ];
    let done = false;
    while ( ! done) {
      const result = counter.next();
      assert.deepStrictEqual(result.value, values.shift());
      done = result.done;
    }
    assert.equal(values.length, 0);
    assert.deepStrictEqual(counter.next(), { done: true });
  });

  it('should iterate from start frame including quads', () => {
    const counter = new Counter(2, 1, 1, true);
    const values = [
      { frameIndex: 1, milliseconds: 500, quad: 0 },
      { frameIndex: 1, milliseconds: 500, quad: 1 },
      { frameIndex: 1, milliseconds: 500, quad: 2 },
      { frameIndex: 1, milliseconds: 500, quad: 3 },
    ];
    let done = false;
    while ( ! done) {
      const result = counter.next();
      assert.deepStrictEqual(result.value, values.shift());
      done = result.done;
    }
    assert.equal(values.length, 0);
    assert.deepStrictEqual(counter.next(), { done: true });
  });
});
