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

helpers.isEntity = type => ['person', 'location'].indexOf(type) !== -1;

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
        p: 0,
      });
    }
    vs.push(values[i]);
  }
  return vs;
};

helpers.timeline.fromBuckets = (buckets) => {
  const values = buckets.map(d => ({
    ...d,
    w: d.count,
    w1: 0,
    t: parseInt(d.val, 10),
  })).sort((a, b) => a.t - b.t);
  // add zeroes
  return helpers.timeline.addEmptyYears(values);
};

helpers.numbers = {};

/**
 * Like `Number#toFixed` but only if there is a decimal part
 * longer than `decimalPlaces`.
 */
helpers.numbers.toFixedOptional = (value, decimalPlaces) => {
  const [integerPart, decimalPart] = `${value}`.split('.');

  if (decimalPart !== undefined) {
    return `${integerPart}.${decimalPart.slice(0, decimalPlaces)}`;
  }
  return integerPart;
};

const Helpers = {
  install(Vue) {
    Vue.helpers = helpers;
    Vue.prototype.$helpers = helpers;
  },
  ...helpers,
};

export default Helpers;
