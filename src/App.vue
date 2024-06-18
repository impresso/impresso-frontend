<template>
  <div id="app" class="bg-light">
    <div id="app-header">
      <the-header />
    </div>
    <div id="app-content">
      <router-view :filters="filters" :filters-with-items="filtersWithItems" />
    </div>
    <div id="app-monitor" class="fullscreen">
      <monitor />
    </div>
    <div id="app-selection-monitor" class="fullscreen">
      <SelectionMonitor
        :filters="filtersWithItems"
        @change="handleChangeFilters"
        :startYear="startYear"
        :endYear="endYear"
      />
    </div>
    <div id="app-disclaimer-notice" class="fullscreen" v-if="!termsAgreed">
      <disclaimer-notice />
    </div>
    <div id="app-loading" class="fullscreen locked" v-if="is_locked">
      <status-indicator />
    </div>
    <cookie-disclaimer />
    <TroublesAhead v-if="enableTroublesAhead" />
    <Toaster />
  </div>
</template>

<script>
import WebFontLoader from 'webfontloader'
import TheHeader from '@/components/TheHeader.vue'
import Monitor from '@/components/Monitor.vue'
import SelectionMonitor from '@/components/SelectionMonitor.vue'
import DisclaimerNotice from '@/components/modals/DisclaimerNotice.vue'
import StatusIndicator from '@/components/modals/StatusIndicator.vue'
import CookieDisclaimer from '@/components/modals/CookieDisclaimer.vue'
import TroublesAhead from '@/components/modals/TroublesAhead.vue'
import Toaster from '@/components/base/Toaster.vue'
import { CommonQueryParameters } from './router/util'
import { joinFiltersWithItems, optimizeFilters, serializeFilters } from './logic/filters'
import { searchQueryGetter } from './logic/queryParams'
import { filtersItems } from './services'
import { mapStores } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { useNotificationsStore } from '@/stores/notifications'
import { Navigation } from './plugins/Navigation'

export default {
  name: 'app',
  components: {
    TheHeader,
    Monitor,
    SelectionMonitor,
    DisclaimerNotice,
    StatusIndicator,
    CookieDisclaimer,
    TroublesAhead,
    Toaster,
  },
  data: () => ({
    filtersWithItems: [],
    enableTroublesAhead: import.meta.env.VITE_MAINTENANCE.length > 0,
  }),
  props: {
    startYear: {
      type: Number,
      default: 1700,
    },
    endYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
  },
  computed: {
    ...mapStores(useSettingsStore, useUserStore, useNotificationsStore),
    searchQuery: {
      ...searchQueryGetter(),
    },
    /** @returns {Filter[]} */
    filters() {
      // filter by type
      return this.searchQuery.filters
    },
    termsAgreed() {
      console.info('Terms agreement:', this.settingsStore.termsAgreed)
      if (this.userStore.userData) {
        return true
      }
      return this.settingsStore.termsAgreed
    },
    is_locked() {
      return this.notificationsStore.processingLocked
    },
    $navigation() {
      return new Navigation(this)
    },
  },
  methods: {
    handleChangeFilters(filters) {
      // eslint-disable-next-line no-console
      console.debug('[App] handleChangeFilters', serializeFilters(optimizeFilters(filters)))
      this.$navigation.updateQueryParameters({
        [CommonQueryParameters.SearchFilters]: serializeFilters(optimizeFilters(filters)),
      })
    },
    async loadFilterItems() {
      const filtersWithItems = await filtersItems
        .find({ query: { filters: serializeFilters(this.filters) } })
        .then(joinFiltersWithItems)
      this.filtersWithItems = filtersWithItems
      // eslint-disable-next-line
      console.debug('[App] loadFilterItems', filtersWithItems)
    },
  },
  mounted() {
    window.addEventListener('click', () => {
      this.$root.$emit('bv::hide::popover')
    })
  },
  created() {
    // load typekit
    WebFontLoader.load({
      typekit: {
        id: import.meta.env.VITE_TYPEKIT_ID,
      },
    })
    console.info('enable MAINTENANCE:', import.meta.env.VITE_MAINTENANCE.length)
  },
  watch: {
    filters() {
      this.loadFilterItems()
    },
  },
}
</script>

<style lang="scss">
@import 'impresso-theme/src/scss/variables.sass';

@font-face {
  font-family: 'Satoshi-Variable';
  src: url('/assets/fonts/Satoshi-Variable.woff2') format('woff2'),
    url('/assets/fonts/Satoshi-Variable.woff') format('woff'),
    url('/assets/fonts/Satoshi-Variable.ttf') format('truetype');
  font-weight: 300 900;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: 'Satoshi-VariableItalic';
  src: url('/assets/fonts/Satoshi-VariableItalic.woff2') format('woff2'),
    url('/assets/fonts/Satoshi-VariableItalic.woff') format('woff'),
    url('/assets/fonts/Satoshi-VariableItalic.ttf') format('truetype');
  font-weight: 300 900;
  font-display: swap;
  font-style: italic;
}

// @font-face {
//   font-family: 'Sentient-Variable';
//   src: url('/assets/fonts/Sentient-Variable.woff2') format('woff2'),
//     url('/assets/fonts/Sentient-Variable.woff') format('woff'),
//     url('/assets/fonts/Sentient-Variable.ttf') format('truetype');
//   font-weight: 300 900;
//   font-display: swap;
//   font-style: normal;
// }

// @font-face {
//   font-family: 'Sentient-VariableItalic';
//   src: url('/assets/fonts/Sentient-VariableItalic.woff2') format('woff2'),
//     url('/assets/fonts/Sentient-VariableItalic.woff') format('woff'),
//     url('/assets/fonts/Sentient-VariableItalic.ttf') format('truetype');
//   font-weight: 300 900;
//   font-display: swap;
//   font-style: normal;
// }

$clr-white: #ffffff;
// $clr-dark: #212529;
$clr-grey-100: #17191c;
$clr-grey-300: #424a52;
$clr-grey-400: #5a6672;
$clr-grey-800: #c6ccd2;
$clr-grey-900: #ddd;

:root {
  --impresso-color-paper: #fafbf2;

  --impresso-color-yellow-code: 255, 235, 120;
  --impresso-color-yellow: #ffeb78;
  --impresso-color-yellow-alpha-20: rgba(255, 235, 120, 0.2);
  --impresso-color-yellow-alpha-30: rgba(255, 235, 120, 0.3);
  --impresso-color-yellow-alpha-50: rgba(255, 235, 120, 0.5);
  --impresso-color-yellow-alpha-80: rgba(255, 235, 120, 0.8);

  --impresso-color-black: #343a40;
  --impresso-color-black-rgb: 52, 58, 64;

  --impresso-color-pastel-blue: rgba(86, 204, 242);
  --impresso-color-pastel-blue-alpha-20: rgba(86, 204, 242, 0.2);

  --impresso-border-radius-xs: 5px;
  --impresso-border-radius-sm: 10px;
  --impresso-border-radius-md: 15px;
  --impresso-border-radius-lg: 20px;
  --impresso-border-radius-xl: 30px;
  --impresso-font-size-smallcaps: 0.72em;
  --impresso-letter-spacing-smallcaps: 0.08em;
  --impresso-font-size-smaller: 0.85em;
  --impresso-wght: 450;
  --impresso-wght-bold: 700;
  --impresso-wght-smallcaps: 580;
  --impresso-wght-smallcaps-bold: 800;
  --clr-white: #f8f8ff;
  --clr-white-rgba-20: #ffffff33;
  --clr-dark: var(--impresso-color-black);

  --clr-grey-100: #3d4146;
  --clr-grey-200: #5b5e65;
  --clr-grey-300: #84868e;
  --clr-grey-400: #a9aab4;
  --clr-grey-500: #c2c3cb;
  --clr-grey-600: #d4d5e1;
  --clr-grey-700: #e1e1ee;
  --clr-grey-800: #ececfb;
  --clr-grey-900: #f8f8ff;
  --clr-grey-100-rgba-20: #464d5333;
  --clr-grey-200-rgba-20: #585d6633;
  --clr-grey-300-rgba-20: #7c7f8c33;
  --clr-grey-400-rgba-20: #a0a1a333;
  --clr-grey-500-rgba-20: #b1b2c633;
  --clr-grey-600-rgba-20: #c3c4d933;
  --clr-grey-700-rgba-20: #d5d5ec33;
  --clr-grey-800-rgba-20: #e7e7ff33;
  --clr-grey-900-rgba-20: #f8f8ff33;

  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 1rem;
  --spacing-4: 1.5rem;
  --spacing-5: 3rem;
  --negative-spacing-1: -0.25rem;
  --negative-spacing-2: -0.5rem;
  --negative-spacing-3: -1rem;
  --negative-spacing-4: -1.5rem;
  --negative-spacing-5: -3rem;

  --accent: #28a745;
  --impresso-yellow: #ffeb78;
  --border-radius-sm: 3px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;

  /* Bootstrap overrides */
  --bs-font-sans-serif: 'Satoshi-Variable', sans-serif;
  --bs-font-sans-serif-italic: 'Satoshi-VariableItalic', sans-serif;
  --bs-font-serif-italic: 'questa', serif;
  --bs-font-serif: 'questa', serif;
  --bs-border-radius-lg: var(--impresso-border-radius-lg);
  --bs-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  --bs-box-shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.125);
  --bs-box-shadow-md: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  --bs-box-shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  --bs-box-shadow-inset: inset 0 1px 2px rgba(0, 0, 0, 0.075);

  --bs-font-size-base: 1rem;
  --impresso-font-size-3: 1.75rem;
  --impresso-font-size-4: 1.5rem;
}

body {
  font-family: var(--bs-font-sans-serif);
  font-weight: 450;
  font-variation-settings: 'wght' 450;
  text-rendering: optimizeLegibility;
}
body,
html {
  height: 100%;
}
h1,
h2,
h3,
h4,
h5,
h6,
.h1,
.h2,
.h3,
.h4,
.h5,
.h6 {
  font-family: var(--bs-font-serif);
  font-weight: 375;
  font-variation-settings: 'wght' 375;

  i,
  em {
    font-family: var(--bs-font-serif-italic);
    font-weight: 375;
    font-variation-settings: 'wght' 375;
  }
}
i,
em {
  font-style: normal;
}
.text-sans,
.sans,
legend,
.small-caps,
.textbox-fancy .label,
.heading-top,
.btn-sm,
.btn-group-sm > .btn,
h6.dropdown-header {
  font-family: var(--bs-font-sans-serif);
  font-weight: 450;
  font-variation-settings: 'wght' 450;
}

label {
  font-family: var(--bs-font-sans-serif);
  font-weight: 450;
  font-variation-settings: 'wght' 450;
}

.checkbox label,
.small-caps {
  text-transform: uppercase;
  font-size: var(--impresso-font-size-smallcaps);
  font-variant: normal;
  letter-spacing: var(--impresso-letter-spacing-smallcaps);
  font-weight: var(--impresso-wght-smallcaps);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
}
.font-weight-bold {
  font-weight: 700;
  font-variation-settings: 'wght' 700;
}
.btn-sm,
.btn-group-sm > .btn {
  font-size: var(--impresso-font-size-smallcaps);
  text-transform: uppercase;
  font-variant: normal;
  letter-spacing: var(--impresso-letter-spacing-smallcaps);
  line-height: 2em;
  font-weight: var(--impresso-wght-smallcaps);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
  padding: 0.3em 0.95em 0.25em 0.95em;
  border-radius: var(--border-radius-sm);
  white-space: nowrap;
}
.input-group .btn,
.btn-group-sm > .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.input-group .btn:first-of-type,
.btn-group-sm > .btn:first-of-type {
  border-top-left-radius: var(--border-radius-sm);
  border-bottom-left-radius: var(--border-radius-sm);
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.input-group .btn:last-of-type,
.btn-group-sm > .btn:last-of-type {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: var(--border-radius-sm);
  border-bottom-right-radius: var(--border-radius-sm);
}
.btn-outline-primary,
.btn-outline-secondary,
.btn-primary,
.btn-outline-success {
  border-radius: var(--border-radius-sm);
  box-shadow: var(--bs-box-shadow-sm);
}
.btn.disabled,
.btn:disabled {
  opacity: 0.45 !important;
}
.btn-outline-primary.disabled,
.btn-outline-primary:disabled {
  background-color: $clr-tertiary !important;
}

.btn-outline-icon {
  border-radius: 50%;
  position: relative;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  margin: 0;
  font-size: 1rem;
  border-color: var(--clr-grey-600);
  color: var(--clr-grey-600);
  box-shadow: var(--bs-box-shadow-sm);
  > span {
    color: inherit;
  }
  &:hover {
    border-color: #17191c;
    color: #17191c;
  }
}

.btn-outline-icon > span {
  position: absolute;
  top: 3px;
  left: 3px;
}
.btn-md {
  border-radius: var(--border-radius-md);
  box-shadow: var(--bs-box-shadow-sm);
  border-width: 0;

  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
}
.shadow-sm {
  box-shadow: var(--bs-box-shadow-sm);
}
.drop-shadow {
  box-shadow: var(--bs-box-shadow-md);
}

.navbar-nav label {
  text-transform: uppercase;
  font-size: var(--impresso-font-size-smallcaps);
  font-variant: normal;
  letter-spacing: var(--impresso-letter-spacing-smallcaps);
  font-weight: var(--impresso-wght-smallcaps);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
}
// .btn-primary {
//   border-radius: 2px;
//   box-shadow: rgba(50, 50, 105, 0.15) 0px 2px 3px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1px 0px,
//     inset rgba(255, 255, 255, 0.18) 0px 1px 1px 0px;
// }

#app {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: min-content auto;
  grid-template-areas: 'appheader' 'appcontent';
  height: 100%;
  #app-header {
    grid-area: appheader;
  }

  #app-content {
    grid-area: appcontent;
    overflow-y: auto;
    position: relative;
  }

  .fullscreen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    &.locked {
      background: rgba(var(--impresso-color-black), 0.25);
      pointer-events: auto;
    }
  }

  #app-search-query-explorer {
    z-index: 1040;
  }

  #app-explorer {
    z-index: 1041;
  }

  #app-selection-monitor {
    z-index: 1042;
  }
  #app-monitor {
    z-index: 1042;
  }

  #app-loading {
    z-index: 1043;
  }
}
select {
  appearance: inherit;
}
span.number {
  // font-family: 'questa-sans', sans-serif;
}
svg {
  text {
    font-family: 'questa-sans', sans-serif;
  }
  // axis
  g.tick > line {
    stroke: $clr-tertiary;
  }
  path.domain {
    stroke: $clr-quaternary;
  }
}

ul.nav.nav-pills {
  border-bottom: 1px solid var(--clr-grey-200);
}
ul.nav.nav-pills .nav-item .nav-link {
  background-color: transparent;
  font-variant: normal;
  letter-spacing: var(--impresso-letter-spacing-smallcaps);
  text-transform: uppercase;
  font-size: var(--impresso-font-size-smallcaps);
  font-weight: var(--impresso-wght-smallcaps);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
  border-bottom: 1px solid transparent;
}
ul.nav.nav-pills .nav-item.active .nav-link,
ul.nav.nav-pills .nav-item .nav-link.active {
  color: var(--impresso-color-black);

  font-weight: var(--impresso-wght-smallcaps-bold);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps-bold);
  box-shadow: var(--clr-grey-200) 0px 2px 0px 0px, var(--clr-grey-200) 0px 2px 0px 0px;
  border-bottom: 1px solid var(--clr-grey-200);
}
ul.nav.nav-pills .nav-item {
  // hover
  &:hover .nav-link {
    color: var(--impresso-color-black);
    /** box shadow that looks like a border bottom solid  */
    box-shadow: var(--impresso-color-black) 0px 2px 0px 0px;
  }
}

.bg-dark ul.nav.nav-pills {
  border-bottom: 1px solid $clr-grey-400;
}
.bg-dark ul.nav.nav-pills .nav-item {
  .nav-link {
    color: $clr-grey-800;
  }
  &.active .nav-link,
  .nav-link.active {
    color: white;
    box-shadow: 0 2px 0px -1px white;
  }
}

// ul.nav.nav-pills {
//   border-bottom: 1px solid #dee2e6;
// }
// ul.nav.nav-pills .nav-item {
//   .nav-link {
//     background-color: transparent;
//     font-variant: small-caps;
//     margin-bottom: -1px;
//     border: 1px solid transparent;
//     font-size: 15px; // like small-caps
//     color: #6e8091;
//   }
//   &.active .nav-link {
//     color: black;
//     border-color: #dee2e6;
//     border-bottom-color: #f8f9fa;
//     background-color: transparent;
//   }
//   .nav-link.active {
//     color: black;
//     border-color: #dee2e6;
//     border-bottom-color: #f8f9fa;
//     background-color: transparent;
//   }
// }

.rounded {
  border-radius: var(--border-radius-md) !important;
}
.rounded-lg {
  border-radius: var(--border-radius-lg) !important;
}
.bg-medium {
  background: $clr-grey-900;
}
.pt-1px {
  padding-top: 1px;
}
.pb-1px {
  padding-bottom: 1px;
}
.mt-1px {
  margin-top: 1px;
}
.mt-2px {
  margin-top: 2px;
}
.mb-1px {
  margin-bottom: 1px;
}
.mr-1px {
  margin-right: 1px;
}
.ml-1px {
  margin-left: 1px;
}
.opacity-50 {
  opacity: 0.5;
}

.border-primary {
  border-color: var(--impresso-color-black) !important;
}

.border-tertiary {
  border-color: $clr-tertiary !important;
}

.border-radius {
  border-radius: 3px;
}

.bg-primary {
  background-color: var(--impresso-color-black);
  color: $clr-white;
}

.bg-secondary {
  background-color: $clr-secondary;
  color: $clr-white;
}

.bg-tertiary {
  background-color: $clr-tertiary;
}

.bg-accent {
  background-color: $clr-accent;
}

.bg-accent-secondary {
  background-color: $clr-accent-secondary;
  color: $clr-white;
}

.modal-backdrop-disabled {
  pointer-events: none;
}

.text-blue {
  color: blue;
}

.text-ellipsis {
  max-width: 120px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.text-small {
  font-size: 14px;
}
// .small-caps {
//   font-variant: small-caps;
// }

.custom-control-input {
  width: 0;
  height: 0;
}
.custom-control-label::before {
  border-color: $clr-tertiary;
  outline: none;
}
.custom-control-label:disabled::before {
  border-color: $clr-tertiary;
}

.dropdown-toggle[aria-expanded='true'] {
  border-bottom: 1px solid white !important;
}

.bg-dark .btn-primary {
  background-color: white;
  color: black;
  border: 1px solid var(--impresso-color-black);
}
// .btn-outline-primary:hover {
//   color: $clr-dark;
// }

// --- input range sliders ---
// using classes that are browser specific,
// stacking them together would invalidate the whole class
// for other browsers
// Using mixins to avoid duplicate declarations

@mixin slider-rail {
  height: 1px;
  background-color: $clr-secondary;
  border-radius: 2px;
}
@mixin slider-dot {
  // border-radius: 50%;
  background-color: var(--impresso-color-black); // $clr-bg-primary ;
  // border: 1px solid black ;
  box-shadow: none;
}
@mixin slider-dot-focus {
  border-color: $clr-accent-secondary;
}
@mixin slider-dot-active {
  background-color: $clr-accent-secondary;
}

.vue-slider .vue-slider-rail {
  @include slider-rail;
}
input[type='range']::-webkit-slider-runnable-track {
  @include slider-rail;
}
input[type='range']::-moz-range-track {
  @include slider-rail;
}
input[type='range']::-ms-track {
  @include slider-rail;
}

.vue-slider .vue-slider-dot-handle {
  @include slider-dot;
}
input[type='range']::-webkit-slider-thumb {
  margin-top: -0.45rem;
  @include slider-dot;
}
input[type='range']::-moz-range-thumb {
  margin-top: -0.45rem;
  @include slider-dot;
}
input[type='range']::-ms-thumb {
  margin-top: -0.45rem;
  @include slider-dot;
}

.vue-slider:focus .vue-slider-dot-handle {
  @include slider-dot-focus;
}
input[type='range']:focus::-webkit-slider-thumb {
  @include slider-dot-focus;
}
input[type='range']:focus::-moz-range-thumb {
  @include slider-dot-focus;
}
input[type='range']:focus::-ms-thumb {
  @include slider-dot-focus;
}

.vue-slider-dot-focus .vue-slider-dot-handle-focus {
  @include slider-dot-focus;
  @include slider-dot-active;
}
input[type='range']:active::-webkit-slider-thumb {
  @include slider-dot-active;
}
input[type='range']:active::-moz-range-thumb {
  @include slider-dot-active;
}
input[type='range']:active::-ms-thumb {
  @include slider-dot-active;
}

.vue-slider .vue-slider-mark-label {
  font-size: 12px;
}

.vue-slider .vue-slider-process {
  background-color: var(--impresso-color-black);
  box-shadow: 0px 0px 0 6px rgba(0, 0, 0, 0.1);
  height: 2px !important;
  margin-top: 0px;
  border-radius: 1px;
}

.vue-slider .vue-slider-dot-tooltip-inner {
  border-color: var(--impresso-color-black);
  background-color: var(--impresso-color-black);
  padding: 0px 5px 2px 5px;
  border-radius: 1px;
}

.vue-slider .vue-slider-mark-step {
  width: 1px;
  height: 5px;
  border-radius: 0;
  background-color: currentColor;
  margin-top: -1.5px;
}

// hack: hide bottom border on header dropdowns
.header {
  .dropdown.show > .dropdown-toggle {
    border-bottom-color: transparent;
    z-index: 1001;
  }
  // add dots to fix bottom corners
  .dropdown.show::before,
  .dropdown.show::after {
    content: '';
    position: absolute;
    bottom: 0px;
    width: 1px;
    height: 1px;
    background-color: var(--impresso-color-black);
    z-index: 1002;
  }
  .dropdown.show::after {
    right: 0px;
  }
}

// fix size change on hover
.dropdown-toggle::after {
  height: 1rem;
  margin: 0;
  padding-left: 3px;
}
.dropdown-menu {
  min-width: 100px;
  padding: 0;
  // top: -0.5px !important;
  margin-top: -1px;
  width: fit-content;
}

// change button color when bg-dark
.bg-dark .btn.dropdown-toggle {
  border-color: var(--clr-grey-800);
  &:not(.disabled):focus,
  &:hover {
    background-color: transparent;
  }
}

.tooltip-inner {
  max-width: auto;
  text-align: left;
  box-shadow: 0.3em 0.3em 0 rgba(17, 17, 17, 0.2);

  .number {
    color: white;
    font-weight: bold;
  }
}
.fixed-pagination-footer {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 100%;

  .pagination {
    li.page-item > a,
    li.page-item > .page-link {
      border-color: $clr-secondary;
      padding: 0.15em 0.6em;
    }
  }
}
.dark-mode,
.navbar-dark {
  .fixed-pagination-footer {
    background: transparent;
  }
  .page-link,
  .page-item.disabled .page-link {
    background: transparent;
    color: $clr-bg-primary;
  }
  .page-link {
    border-color: transparent !important; // $clr-tertiary !important;
  }
  .page-link:hover,
  .page-item.active .page-link {
    background: $clr-bg-primary;
    color: var(--impresso-color-black);
    border-color: $clr-bg-primary !important;
  }
}

.viz-bar {
  height: 3px;
}

.icon-link {
  cursor: pointer;
  vertical-align: middle;
  line-height: 1;
  color: inherit; // $clr-tertiary;
}
.icon-link:hover {
  color: var(--impresso-color-black);
}

.overlay-region {
  background-color: transparentize($clr-accent-secondary, 1);
  transition: background-color 300ms;
  cursor: pointer;

  &.selected {
    background-color: transparentize($clr-accent-secondary, 0.8);
  }
  &.active {
    background-color: transparentize($clr-accent-secondary, 0.5);
    cursor: inherit;
  }
}

.show-outlines .overlay-region {
  outline: 1px solid $clr-accent-secondary;
}

.overlay-match {
  background: transparentize($clr-accent, 0.5);
  outline: 2px solid $clr-accent;
}

.matches {
  em {
    background: gold;
    color: black;
  }
}
.badge {
  border-radius: var(--border-radius-sm);
  box-shadow: var(--bs-box-shadow-sm);
  font-size: var(--impresso-font-size-smallcaps);
}

.badge-info {
  background-color: #049dae;
}
.badge-language {
  background-color: #e1e6ea;
}
.ngram-highlight {
  background-color: #17191c;
  color: white;
  font-family: 'questa-sans', sans-serif;

  &::after {
    content: '"';
  }
  &::before {
    content: '"';
  }
}

.search-results-summary .ngram-highlight {
  padding: 0 0.25rem;
  margin: 0 0.25rem;
}

.toast {
  .toast-header,
  .toast-body {
    padding: 0.25em 0.5em;
  }
  overflow: hidden;
  border: 1px solid;
}

// uncomment to add background to transparent footers
// .fixed-pagination-footer::before{
//   content: "";
//   position: absolute;
//   bottom: -25%;
//   left: -25%;
//   right: -25%;
//   top: 0;
//   background-color: transparentize(var(--impresso-color-black), 0.3);
// }
/* bounce animation */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

.article-matches em,
.highlight,
span.highlight {
  outline: inherit;
  background-color: var(--impresso-yellow);
}

.bg-dark {
  .article-matches em,
  .highlight,
  span.highlight {
    background-color: var(--impresso-yellow);
    color: black;
    outline: inherit;
  }
}
</style>
