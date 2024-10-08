import Layout from '@/components/layout/Layout.vue';
import Section from '@/components/layout/Section.vue';
import Dropdown from '@/components/layout/Dropdown.vue';
import Slider from '@/components/layout/Slider.vue';
import Spinner from '@/components/layout/Spinner.vue';
import FirstNonemptyChild from '@/components/layout/FirstNonemptyChild';

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
