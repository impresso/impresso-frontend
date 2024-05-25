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

// boostrap-vue

// TODO: complex components

// modal
import { BModal } from 'bootstrap-vue/src/components/modal/modal'
import { BVTransporter } from 'bootstrap-vue/src/components/transporter/transporter'
import { VBModal } from 'bootstrap-vue/src/directives/modal/modal'
import { BVModalPlugin } from 'bootstrap-vue/src/components/modal/helpers/bv-modal'

// toast
import { BVToastPlugin } from 'bootstrap-vue/src/components/toast/helpers/bv-toast'


const BootstrapVueLegacy = {
  install(vue: VueConstructor) {
    vue.component('BButton', BButton);
    vue.component('BCol', BCol);
    vue.component('BRow', BRow);
    vue.component('BNavbar', BNavbar);
    vue.component('BNavbarNav', BNavbarNav);

    vue.component('BNavItem', BNavItem);
    vue.component('BNavItemDropdown', BNavItemDropdown);
    vue.component('BDropdownItem', BDropdownItem);
    vue.component('BAlert', BAlert);
    vue.component('BTabs', BTabs);
    vue.component('BDropdown', BDropdown);
    vue.component('BModal', BModal);
    vue.component('BContainer', BContainer);
    vue.component('BButtonGroup', BButtonGroup);
    vue.component('BBadge', BBadge);
    vue.component('BFormGroup', BFormGroup);
    vue.component('BFormCheckbox', BFormCheckbox);
    vue.component('BFormInput', BFormInput);
    vue.component('BVTransporter', BVTransporter);
    vue.component('BInput', BFormInput);

    vue.directive('BModal', VBModal);

    vue.use(BVModalPlugin);
    vue.use(BVToastPlugin);
  },
};

export default BootstrapVueLegacy;
