import { VueConstructor } from 'vue';

import BButton from '@/components/legacy/bootstrap/BButton.vue';
import BCol from '@/components/legacy/bootstrap/BCol.vue';
import BRow from '@/components/legacy/bootstrap/BRow.vue';
import BNavbar from '@/components/legacy/bootstrap/BNavbar.vue';
import BNavbarNav from '@/components/legacy/bootstrap/BNavbarNav.vue';
import BNavItem from '@/components/legacy/bootstrap/BNavItem.vue';
import BDropdownItem from '@/components/legacy/bootstrap/BDropdownItem.vue';
import BTabs from '@/components/legacy/bootstrap/BTabs.vue';
import BDropdown from '@/components/legacy/bootstrap/BDropdown.vue';
import BContainer from '@/components/legacy/bootstrap/BContainer.vue';
import BButtonGroup from '@/components/legacy/bootstrap/BButtonGroup.vue';
import BBadge from '@/components/legacy/bootstrap/BBadge.vue';
import BFormGroup from '@/components/legacy/bootstrap/BFormGroup.vue';
import BFormCheckbox from '@/components/legacy/bootstrap/BFormCheckbox.vue';
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue';
import BNavItemDropdown from '@/components/legacy/bootstrap/BNavItemDropdown.vue';
import BAlert from '@/components/legacy/bootstrap/BAlert.vue';
import BFormSelect from '@/components/legacy/bootstrap/BFormSelect.vue';

// boostrap-vue
import { BSpinner } from 'bootstrap-vue/src/components/spinner/spinner'
import { BFormDatepicker } from 'bootstrap-vue/src/components/form-datepicker/form-datepicker'


const BootstrapVueLegacy = {
  install(vue: VueConstructor) {
    vue.component('BButton', BButton);
    vue.component('BCol', BCol);
    vue.component('BRow', BRow);
    vue.component('BNavbar', BNavbar);
    vue.component('BNavbarNav', BNavbarNav);
    vue.component('BFormSelect', BFormSelect);
    vue.component('BSpinner', BSpinner);
    vue.component('BFormDatepicker', BFormDatepicker);
    vue.component('BNavItem', BNavItem);
    vue.component('BNavItemDropdown', BNavItemDropdown);
    vue.component('BDropdownItem', BDropdownItem);
    vue.component('BAlert', BAlert);
    vue.component('BTabs', BTabs);
    vue.component('BDropdown', BDropdown);
    vue.component('BContainer', BContainer);
    vue.component('BButtonGroup', BButtonGroup);
    vue.component('BBadge', BBadge);
    vue.component('BFormGroup', BFormGroup);
    vue.component('BFormCheckbox', BFormCheckbox);
    vue.component('BFormInput', BFormInput);
    vue.component('BInput', BFormInput);
  },
};

export default BootstrapVueLegacy;
