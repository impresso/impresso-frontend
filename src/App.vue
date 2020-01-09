<template>
<div id="app" class="bg-light">
  <div id="app-header">
    <the-header />
  </div>
  <div id="app-content">
    <router-view />
  </div>
  <div id="app-explorer" class="fullscreen">
    <explorer/>
  </div>
  <div id="app-monitor" class="fullscreen">
    <monitor/>
  </div>
  <div id="app-disclaimer-notice" class="fullscreen" v-if="!termsAgreed">
    <disclaimer-notice />
  </div>
  <div id="app-loading" class="fullscreen locked" v-if="is_locked">
    <status-indicator />
  </div>
</div>
</template>

<script>
import WebFontLoader from 'webfontloader';
import TheHeader from './components/TheHeader';
import Monitor from './components/Monitor';
import Explorer from './components/Explorer';
import DisclaimerNotice from './components/modals/DisclaimerNotice';
import StatusIndicator from './components/modals/StatusIndicator';

export default {
  name: 'app',
  components: {
    TheHeader,
    Monitor,
    Explorer,
    DisclaimerNotice,
    StatusIndicator,
  },
  computed: {
    termsAgreed() {
      console.info('Terms agreement:', this.$store.state.settings.termsAgreed);
      if (this.$store.state.user.userData) {
        return true;
      }
      return this.$store.state.settings.termsAgreed;
    },
    is_locked() {
      return this.$store.state.processingLocked;
    },
  },
  methods: {
    onEventBusAddFilter({ filter, searchQueryId }) {
      console.info('@eventBus.ADD_FILTER_TO_SEARCH_QUERY', searchQueryId, 'filter:', filter);
      if (!searchQueryId || !searchQueryId.length) {
        this.$store.dispatch('search/ADD_FILTER', { filter });
      }
    },
  },
  mounted() {
    window.addEventListener('click', () => {
      this.$root.$emit('bv::hide::popover');
    });
    this.$eventBus.$on(this.$eventBus.ADD_FILTER_TO_SEARCH_QUERY, this.onEventBusAddFilter);
  },
  beforeDestroy() {
    this.$eventBus.$off(this.$eventBus.ADD_FILTER_TO_SEARCH_QUERY, this.onEventBusAddFilter);
  },
  created() {
    // load typekit
    WebFontLoader.load({
      typekit: {
        id: process.env.TYPEKIT_ID,
      },
    });
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";
body,
html {
    height: 100%;
}
#app {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: min-content auto;
    grid-template-areas: "appheader" "appcontent";
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
      &.locked{
        background: rgba($clr-primary, 0.25);
        pointer-events: auto;
      }
    }

    #app-search-query-explorer{
      z-index: 1040;
    }

    #app-explorer{
      z-index: 1041;
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
  font-family: "questa-sans", sans-serif;
}
svg {
  text {
    font-family: "questa-sans", sans-serif;
  }
  // axis
  g.tick > line{
    stroke: $clr-tertiary;
  }
  path.domain {
    stroke: $clr-quaternary;
  }
}

ul.nav.nav-pills{
  border-bottom: 1px solid #dee2e6;
}
ul.nav.nav-pills .nav-item{
    .nav-link {
      background-color: transparent;
      font-variant: small-caps;
      margin-bottom: -1px;
      border: 1px solid transparent;

      color: #a8b3bd;
    }
    &.active .nav-link{
      color: black;
      border-color: #dee2e6;
      border-bottom-color: #f8f9fa;
      background-color: transparent;
    }
    .nav-link.active{
      color: black;
      border-color: #dee2e6;
      border-bottom-color: #f8f9fa;
      background-color: transparent;
    }
}

$clr-white: #ffffff;
$clr-grey-100: #17191c;
$clr-grey-300: #424a52;
$clr-grey-400: #5a6672;
$clr-grey-800: #c6ccd2;
$clr-grey-900: #ddd;

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

.custom-control-input {
  width: 0;
  height: 0;
}
.custom-radio > .custom-control-label::before {
    border: inherit;
    outline: inherit;
}
.tooltip-inner {
    max-width: auto;
    text-align: left;
    box-shadow: 0.3em 0.3em 0 rgba(17, 17, 17, 0.2);
}
.dropdown-menu {
    padding: 0;
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
        li.page-item > span.page-link {
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
  height: 2px;
}

.icon-link {
  cursor: pointer;
  vertical-align: middle;
  line-height: 1;
  color: $clr-tertiary;
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

.overlay-match{
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

.btn-outline-icon{
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
  >span{
    color: inherit;
  }
  &:hover{
    border-color: #17191c;
    color: #17191c;
  }
}

.badge-info{
  background-color: #049dae;
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
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
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

</style>
