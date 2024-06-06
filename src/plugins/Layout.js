import Layout from '@/components/layout/Layout';
import Section from '@/components/layout/Section.vue';
import Dropdown from '@/components/layout/Dropdown.vue';
import Slider from '@/components/layout/Slider';
import Spinner from '@/components/layout/Spinner';
import FirstNonemptyChild from '@/components/layout/FirstNonemptyChild.vue';

const ImpressoLayout = {
  install(Vue) {
    Vue.component('iLayout', Layout);
    Vue.component('iLayoutSection', Section);
    Vue.component('iLayoutSlider', Slider);
    Vue.component('iDropdown', Dropdown);
    Vue.component('iSpinner', Spinner);
    Vue.component('iFirstNonemptyChild', FirstNonemptyChild);
  },
};

export default ImpressoLayout;
