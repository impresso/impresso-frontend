const helpers = {};

helpers.groupBy = (data, key) => data.reduce((reduced, item) => {
  (reduced[item[key]] = reduced[item[key]] || []).push(item);
  return reduced;
}, {});

const Helpers = {
  install(Vue) {
    Vue.helpers = helpers;
    Vue.prototype.$helpers = helpers;
  },
};

export default Helpers;
