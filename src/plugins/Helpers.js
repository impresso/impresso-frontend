const helpers = {};

const timelineValuesSorter = (a, b) => a.t - b.t;

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

/**
 * Add empty intervals to a list of timeline items (Item is a `{ w, t, w1, p }` object).
 * Interval value is `t` and it can be either a number of a date. Intervals are considered
 * with an interval unit which is either `number`, `year` or `month`.
 * @param {object[]} values timeline item values
 * @param {string} unit interval units
 */
helpers.timeline.addEmptyIntervals = (values, unit = 'number') => {
  if (!values.length) {
    return [];
  }
  // add zeroes to values array. Use the current extent.
  const vs = [values[0]];

  for (let i = 1, l = values.length; i < l; i += 1) {
    let diff;
    switch (unit) {
      case 'year':
        diff = Math.round((values[i].t - values[i - 1].t) / (365 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        diff = Math.round((values[i].t - values[i - 1].t) / (30 * 24 * 60 * 60 * 1000));
        break;
      default:
        diff = values[i].t - values[i - 1].t;
    }
    for (let j = 1; j < diff; j += 1) {
      let newValue;
      switch (unit) {
        case 'year':
          newValue = new Date(values[i - 1].t);
          newValue.setFullYear(values[i - 1].t.getFullYear() + j);
          break;
        case 'month':
          newValue = new Date(values[i - 1].t);
          newValue.setMonth(values[i - 1].t.getMonth() + j);
          break;
        default:
          newValue = values[i - 1].t + j;
      }
      vs.push({
        t: newValue,
        w: 0,
        w1: 0,
        p: 0,
      });
    }
    vs.push(values[i]);
  }
  return vs;
};

helpers.timeline.addEmptyYearsWithRange = (timelineValues, timelineRange) => {
  if (!timelineRange) return timelineValues;
  const [rangeMin, rangeMax] = timelineRange;
  const presentYears = timelineValues.map(({ t }) => t);

  const rangeSize = rangeMax - rangeMin;
  if (isNaN(rangeSize)) return timelineValues;

  const range = [...Array(rangeSize).keys()].map(i => rangeMin + i);

  return range.reduce((values, year) => {
    if (presentYears.indexOf(year) === -1) {
      values.push({ t: year, w: 0 });
    }
    return values;
  }, timelineValues).sort(timelineValuesSorter);
};

helpers.timeline.fromBuckets = (buckets) => {
  const values = buckets.map(d => ({
    ...d,
    w: d.count,
    w1: 0,
    t: parseInt(d.val, 10),
  })).sort((a, b) => a.t - b.t);
  // add zeroes
  return helpers.timeline.addEmptyIntervals(values);
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
