import { Plugin as Fragment } from 'vue-fragment'
import Layout from '@/components/layout/Layout';
import Section from '@/components/layout/Section';
import Dropdown from '@/components/layout/Dropdown';
import Slider from '@/components/layout/Slider';
import Spinner from '@/components/layout/Spinner';
import FirstNonemptyChild from '@/components/layout/FirstNonemptyChild';

const ImpressoLayout = {
  install(Vue) {
    Vue.component('iLayout', Layout);
    Vue.component('iLayoutSection', Section);
    Vue.component('iLayoutSlider', Slider);
    Vue.component('iDropdown', Dropdown);
    Vue.component('iSpinner', Spinner);
    Vue.component('iFirstNonemptyChild', FirstNonemptyChild);
    Vue.use(Fragment)
  },
};

export default ImpressoLayout;
