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

const Helpers = {
  install(Vue) {
    Vue.helpers = helpers;
    Vue.prototype.$helpers = helpers;
  },
};

export default Helpers;
