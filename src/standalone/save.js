const { saveAs } = require('file-saver');

const pad = (number, length) => {
  let str = `${number}`;
  while (str.length < length) {
    str = `0${str}`;
  }
  return str;
};

const save = (blob, config, counter) => {
  const { totalFrames } = counter;
  const digits = totalFrames.toString().length;
  let frameString = pad(counter.frame, digits);
  if (counter.quads) {
    frameString += `_${counter.quad}`;
  }
  const filename = `${config.prefix}${frameString}.png`;
  saveAs(blob, filename);
};

module.exports = save;
