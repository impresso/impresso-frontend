const OPENGRAPH_PROPERTIES = [
  'og:title',
  'og:site_name',
  'og:type',
  'og:description',
  'og:article:published_time',
];

const DC_PROPERTIES = [
  'DC.title',
  'DC.creator',
  'DCTERMS.issued',
  'DCTERMS.publisher',
];

const META_PROPERTY = [
  'description',
];

const getOrCreate = (selector = 'meta[name=description]') => {
  const tag = document.querySelector(selector);
  if (tag) {
    return tag;
  }
  const el = document.createElement('meta');
  document.getElementsByTagName('head')[0].appendChild(el);
  return el;
}

const MetaTags = {
  install(Vue, { suffix } = {}) {
    Vue.prototype.$renderMetaTags = ({
      title = 'title',
      // objects { property: content }
      opengraph = {},
      // objects { name: content }
      dc = {},
      // objects { name: content }
      meta = {},
    } = {}) => {
      // console.info('$metaTags setting title:', title, description, openGraph);
      document.title = suffix ? [title, suffix].join(' - ') : title;
      console.info('Vue.prototype.$renderMetaTag', title);
      META_PROPERTY.forEach((name) => {
        const el = getOrCreate(`meta[name=${name}]`);
        el.setAttribute('content', meta[name] || '');
      });
      DC_PROPERTIES.forEach((name) => {
        const el = getOrCreate(`meta[name=${name}]`);
        el.setAttribute('content', dc[name] || '');
      });
      OPENGRAPH_PROPERTIES.forEach((prop) => {
        // <meta property="og:title" content="The Rock" />
        const el = getOrCreate(`meta[property=${prop}]`);
        el.setAttribute('content', opengraph[prop] || '');
      });
    };
  },
};

export default MetaTags;
