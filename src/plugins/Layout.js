import Layout from '@/components/layout/Layout';
import Section from '@/components/layout/Section';

const ImpressoLayout = {
  install(Vue) {
    Vue.component('iLayout', Layout);
    Vue.component('iSection', Section);
  },
};

export default ImpressoLayout;
