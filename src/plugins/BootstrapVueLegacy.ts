import { VueConstructor } from 'vue';

import BButton from '@/components/legacy/bootstrap/BButton.vue';
import BCol from '@/components/legacy/bootstrap/BCol.vue';
import BRow from '@/components/legacy/bootstrap/BRow.vue';
import BNavbar from '@/components/legacy/bootstrap/BNavbar.vue';

// boostrap-vue
// import { BNavbar } from 'bootstrap-vue/src/components/navbar/navbar'
import { BNavbarBrand } from 'bootstrap-vue/src/components/navbar/navbar-brand'
import { BNavbarNav } from 'bootstrap-vue/src/components/navbar/navbar-nav'
import { BNavItem } from 'bootstrap-vue/src/components/nav/nav-item'
import { BNavItemDropdown } from 'bootstrap-vue/src/components/nav/nav-item-dropdown'
import { BDropdownItem } from 'bootstrap-vue/src/components/dropdown/dropdown-item'
import { BAlert } from 'bootstrap-vue/src/components/alert/alert'
import { BProgress } from 'bootstrap-vue/src/components/progress/progress'
import { BTabs } from 'bootstrap-vue/src/components/tabs/tabs'
import { BDropdown } from 'bootstrap-vue/src/components/dropdown/dropdown'
import { BModal } from 'bootstrap-vue/src/components/modal/modal'
import { BNavForm } from 'bootstrap-vue/src/components/nav/nav-form'
import { BPopover } from 'bootstrap-vue/src/components/popover/popover'
import { BContainer } from 'bootstrap-vue/src/components/layout/container'
import { BButtonGroup } from 'bootstrap-vue/src/components/button-group/button-group'
import { BPagination } from 'bootstrap-vue/src/components/pagination/pagination'
import { BBadge } from 'bootstrap-vue/src/components/badge/badge'
import { BFormGroup } from 'bootstrap-vue/src/components/form-group/form-group'
import { BFormRadioGroup } from 'bootstrap-vue/src/components/form-radio/form-radio-group'
import { BFormCheckbox } from 'bootstrap-vue/src/components/form-checkbox/form-checkbox'
import { BFormInput } from 'bootstrap-vue/src/components/form-input/form-input'
import { BVTransporter } from 'bootstrap-vue/src/components/transporter/transporter'
import { BTab } from 'bootstrap-vue/src/components/tabs/tab'
import { BForm } from 'bootstrap-vue/src/components/form/form'
import { BTooltip } from 'bootstrap-vue/src/components/tooltip/tooltip'
import { BNavText } from 'bootstrap-vue/src/components/nav/nav-text'


import { VBModal } from 'bootstrap-vue/src/directives/modal/modal'
import { VBTooltip } from 'bootstrap-vue/src/directives/tooltip/tooltip'

import { BVModalPlugin } from 'bootstrap-vue/src/components/modal/helpers/bv-modal'


const BootstrapVueLegacy = {
  install(vue: VueConstructor) {
    vue.component('BButton', BButton);
    vue.component('BCol', BCol);
    vue.component('BRow', BRow);
    vue.component('BNavbar', BNavbar);

    vue.component('BNavbarBrand', BNavbarBrand);
    vue.component('BNavbarNav', BNavbarNav);
    vue.component('BNavItem', BNavItem);
    vue.component('BNavItemDropdown', BNavItemDropdown);
    vue.component('BDropdownItem', BDropdownItem);
    vue.component('BAlert', BAlert);
    vue.component('BProgress', BProgress);
    vue.component('BTabs', BTabs);
    vue.component('BDropdown', BDropdown);
    vue.component('BModal', BModal);
    vue.component('BNavForm', BNavForm);
    vue.component('BPopover', BPopover);
    vue.component('BContainer', BContainer);
    vue.component('BButtonGroup', BButtonGroup);
    vue.component('BPagination', BPagination);
    vue.component('BBadge', BBadge);
    vue.component('BFormGroup', BFormGroup);
    vue.component('BFormRadioGroup', BFormRadioGroup);
    vue.component('BFormCheckbox', BFormCheckbox);
    vue.component('BFormInput', BFormInput);
    vue.component('BVTransporter', BVTransporter);
    vue.component('BTab', BTab);
    vue.component('BForm', BForm);
    vue.component('BInput', BFormInput);
    vue.component('BTooltip', BTooltip);
    vue.component('BNavText', BNavText);

    vue.directive('BModal', VBModal);
    vue.directive('BTooltip', VBTooltip);

    vue.use(BVModalPlugin);
  },
};

export default BootstrapVueLegacy;
