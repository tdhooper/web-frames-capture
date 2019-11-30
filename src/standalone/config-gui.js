
const inputs = document.querySelectorAll('.settings input');

const config = {};

function settingsChanged() {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const name = input.id.split('-')[0];
    let { value } = input;
    if (input.type === 'number') {
      value = parseFloat(value);
    } else if (input.type === 'checkbox') {
      value = input.checked;
    }
    config[name] = value;
  }
}

settingsChanged();

const setConfig = (newConfig) => {
  if (typeof newConfig !== 'object') {
    return;
  }
  Object.assign(config, newConfig);

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const name = input.id.split('-')[0];
    if (input.type === 'checkbox') {
      input.checked = config[name];
    } else {
      input.value = config[name];
    }
  }
};

for (let i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('change', settingsChanged.bind(this));
  inputs[i].addEventListener('blur', settingsChanged.bind(this));
}

module.exports = {
  settingsChanged,
  setConfig,
  config,
};
