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
  </div>
</template>

<script>
import WebFontLoader from 'webfontloader'
import TheHeader from './components/TheHeader'
import Monitor from './components/Monitor'
import SelectionMonitor from './components/SelectionMonitor'
import DisclaimerNotice from './components/modals/DisclaimerNotice'
import StatusIndicator from './components/modals/StatusIndicator'
import CookieDisclaimer from './components/modals/CookieDisclaimer'
import TroublesAhead from './components/modals/TroublesAhead'
import { CommonQueryParameters } from './router/util'
import { joinFiltersWithItems, optimizeFilters, serializeFilters } from './logic/filters'
import { searchQueryGetter } from './logic/queryParams'
import { filtersItems } from './services'

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
    searchQuery: {
      ...searchQueryGetter(),
    },
    /** @returns {Filter[]} */
    filters() {
      // filter by type
      return this.searchQuery.filters
    },
    termsAgreed() {
      console.info('Terms agreement:', this.$store.state.settings.termsAgreed)
      if (this.$store.state.user.userData) {
        return true
      }
      return this.$store.state.settings.termsAgreed
    },
    is_locked() {
      return this.$store.state.processingLocked
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
    console.info('[App] enable MAINTENANCE:', this.enableTroublesAhead)
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
body,
html {
  height: 100%;
}
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
      background: rgba($clr-primary, 0.25);
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
  font-family: 'questa-sans', sans-serif;
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
  border-bottom: 1px solid $clr-tertiary;
}

ul.nav.nav-pills .nav-item {
  .nav-link {
    background-color: transparent;
    font-variant: small-caps;
    font-size: 15px;
  }
  &.active .nav-link,
  .nav-link.active {
    color: $clr-primary;
    font-weight: bold;
    /** box shadow that looks like a border bottom solid  */
    box-shadow: 0 2px 0px -1px $clr-primary; // 0 2px 0 -1px $clr-primary inset;
  }
  // hover
  &:hover .nav-link {
    color: $clr-primary;
    /** box shadow that looks like a border bottom solid  */
    box-shadow: 0 2px 0px -1px $clr-primary;
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

$clr-white: #ffffff;
// $clr-dark: #212529;
$clr-grey-100: #17191c;
$clr-grey-300: #424a52;
$clr-grey-400: #5a6672;
$clr-grey-800: #c6ccd2;
$clr-grey-900: #ddd;

:root {
  --clr-white: #ffffff;
  --clr-grey-100: #17191c;
  --clr-grey-300: #424a52;
  --clr-grey-400: #5a6672;
  --clr-grey-800: #c6ccd2;
  --clr-grey-900: #ddd;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 1rem;
  --spacing-4: 1.5rem;
  --spacing-5: 3rem;
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
  border-color: $clr-primary !important;
}

.border-tertiary {
  border-color: $clr-tertiary !important;
}

.border-radius {
  border-radius: 3px;
}

.bg-primary {
  background-color: $clr-primary;
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
.small-caps {
  font-variant: small-caps;
}
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

.btn.disabled,
.btn:disabled {
  opacity: 0.45 !important;
}
.btn-outline-primary.disabled,
.btn-outline-primary:disabled {
  background-color: $clr-tertiary !important;
}

.btn-outline-primary,
.btn-outline-secondary,
.btn-primary {
  border-radius: 2px;
  box-shadow: rgba(50, 50, 105, 0.15) 0px 2px 3px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1px 0px;
}
.btn-primary {
  border-radius: 2px;
  box-shadow: rgba(50, 50, 105, 0.15) 0px 2px 3px 0px, rgba(0, 0, 0, 0.05) 0px 1px 1px 0px,
    inset rgba(255, 255, 255, 0.18) 0px 1px 1px 0px;
}
.dropdown-toggle[aria-expanded='true'] {
  border-bottom: 1px solid white !important;
}

.bg-dark .btn-primary {
  background-color: white;
  color: black;
  border: 1px solid $clr-primary;
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
  background-color: $clr-primary; // $clr-bg-primary ;
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
  background-color: $clr-primary;
  box-shadow: 0px 0px 0 6px rgba(0, 0, 0, 0.1);
  height: 2px !important;
  margin-top: 0px;
  border-radius: 1px;
}

.vue-slider .vue-slider-dot-tooltip-inner {
  border-color: $clr-primary;
  background-color: $clr-primary;
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
    background-color: $clr-primary;
    z-index: 1002;
  }
  .dropdown.show::after {
    right: 0px;
  }
}

.list-item-details .dropdown {
  position: inherit;
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
  top: -0.5px !important;
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
  background: transparentize($clr-primary, 0.8);
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
    color: $clr-primary;
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
  color: $clr-primary;
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
  span {
    color: transparentize($clr-primary, 0.45);
    background: transparentize($clr-primary, 0.94);
  }
  em {
    background: gold;
    color: black;
  }
}

.btn-sm,
.btn-group-sm > .btn {
  white-space: nowrap;
}

.btn-outline-icon {
  color: $clr-grey-400;
  background-color: transparent;
  background-image: none;
  border-color: $clr-grey-400;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  line-height: rem;
  padding: 0;
  margin: 0;
  font-size: 1rem;
  > span {
    color: inherit;
  }
  &:hover {
    border-color: #17191c;
    color: #17191c;
  }
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
//   background-color: transparentize($clr-primary, 0.3);
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
  background-color: #ffeb78;
}

.bg-dark {
  .article-matches em,
  .highlight,
  span.highlight {
    background-color: #ffeb78;
    color: black;
    outline: inherit;
  }
}
</style>
