import Layout from '@/components/layout/Layout';
import Section from '@/components/layout/Section';
import Dropdown from '@/components/layout/Dropdown';

const ImpressoLayout = {
  install(Vue) {
    Vue.component('iLayout', Layout);
    Vue.component('iLayoutSection', Section);
    Vue.component('iDropdown', Dropdown);
  },
};

export default ImpressoLayout;
