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

// boostrap-vue
import { BBadge } from 'bootstrap-vue/src/components/badge/badge'
import { BVTransporter } from 'bootstrap-vue/src/components/transporter/transporter'
import { BTooltip } from 'bootstrap-vue/src/components/tooltip/tooltip'
import { BNavText } from 'bootstrap-vue/src/components/nav/nav-text'
import { BForm } from 'bootstrap-vue/src/components/form/form'
import { BNavForm } from 'bootstrap-vue/src/components/nav/nav-form'
import { BFormGroup } from 'bootstrap-vue/src/components/form-group/form-group'
import { BFormRadioGroup } from 'bootstrap-vue/src/components/form-radio/form-radio-group'
import { BFormCheckbox } from 'bootstrap-vue/src/components/form-checkbox/form-checkbox'
import { BFormInput } from 'bootstrap-vue/src/components/form-input/form-input'

// TODO: complex components
import { BNavItemDropdown } from 'bootstrap-vue/src/components/nav/nav-item-dropdown'
import { BAlert } from 'bootstrap-vue/src/components/alert/alert'
import { BModal } from 'bootstrap-vue/src/components/modal/modal'
import { BPopover } from 'bootstrap-vue/src/components/popover/popover'


import { VBModal } from 'bootstrap-vue/src/directives/modal/modal'
import { VBTooltip } from 'bootstrap-vue/src/directives/tooltip/tooltip'

import { BVModalPlugin } from 'bootstrap-vue/src/components/modal/helpers/bv-modal'


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
    vue.component('BNavForm', BNavForm);
    vue.component('BPopover', BPopover);
    vue.component('BContainer', BContainer);
    vue.component('BButtonGroup', BButtonGroup);
    vue.component('BBadge', BBadge);
    vue.component('BFormGroup', BFormGroup);
    vue.component('BFormRadioGroup', BFormRadioGroup);
    vue.component('BFormCheckbox', BFormCheckbox);
    vue.component('BFormInput', BFormInput);
    vue.component('BVTransporter', BVTransporter);
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
