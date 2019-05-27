import Layout from '@/components/layout/Layout';
import Section from '@/components/layout/Section';
import Dropdown from '@/components/layout/Dropdown';
import Spinner from '@/components/layout/Spinner';

const ImpressoLayout = {
  install(Vue) {
    Vue.component('iLayout', Layout);
    Vue.component('iLayoutSection', Section);
    Vue.component('iDropdown', Dropdown);
    Vue.component('iSpinner', Spinner);
  },
};

export default ImpressoLayout;
