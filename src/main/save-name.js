
const pad = (number, length) => {
  let str = `${number}`;
  while (str.length < length) {
    str = `0${str}`;
  }
  return str;
};

const saveName = (prefix, totalFrames, frameIndex, quads, quad) => {
  const digits = (totalFrames - 1).toString().length;
  let frameString = pad(frameIndex, digits);
  if (quads) {
    frameString += `_${quad}`;
  }
  const filename = `${prefix}${frameString}.png`;
  return filename;
};

module.exports = saveName;
