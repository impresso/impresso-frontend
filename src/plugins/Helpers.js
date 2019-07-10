const helpers = {};

helpers.groupBy = (data, key) => data.reduce((reduced, item) => {
  (reduced[item[key]] = reduced[item[key]] || []).push(item);
  return reduced;
}, {});

helpers.excerpt = (text, { maxWords = 15, maxChars = 300 } = {}) => {
  const words = text.split(/\s+/);
  let result = '';
  if (words.length > maxWords) {
    result = words.slice(0, maxWords).join(' ');
  } else {
    result = text;
  }
  if (result.length > maxChars) {
    return `${result.substr(0, maxChars)} [...]`;
  }
  return `${result} [...]`;
};


helpers.timeline = {};

helpers.timeline.addEmptyYears = (values) => {
  if (!values.length) {
    return [];
  }
  // add zeroes to values array. Use the current extent.
  const vs = [values[0]];

  for (let i = 1, l = values.length; i < l; i += 1) {
    const diff = values[i].t - values[i - 1].t;
    for (let j = 1; j < diff; j += 1) {
      vs.push({
        t: values[i - 1].t + j,
        w: 0,
        w1: 0,
      });
    }
    vs.push(values[i]);
  }
  return vs;
};

const Helpers = {
  install(Vue) {
    Vue.helpers = helpers;
    Vue.prototype.$helpers = helpers;
  },
  ...helpers,
};

export default Helpers;
