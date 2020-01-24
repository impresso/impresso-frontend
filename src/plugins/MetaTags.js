const MetaTags = {
  install(Vue, { suffix } = {}) {
    Vue.prototype.$renderMetaTags = ({
      title = 'title',
      description = 'description',
      openGraph = {},
    } = {}) => {
      console.info('$metaTags setting title:', title, description, openGraph);
      document.title = suffix ? [title, suffix].join(' - ') : title;
    };
  },
};

export default MetaTags;
