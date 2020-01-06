<template>
<i-layout id="HomePage2020" :class="{ 'pt-1px bg-light border-top': showLines, 'bg-dark border-tertiary': darkMode }" >
  <i-layout-section width="400px" :class="{ 'mt-1px mr-1px border-top border-right': showLines,'border-tertiary': darkMode }">
    <!--  header -->
    <div slot="header" :class="{ 'border-bottom border-secondary': showLines }">
      <search-tabs />
      <div class="py-3 px-3">
        <autocomplete v-on:submit="onSuggestion" />
      </div>
    </div>
    <!--  body -->

    <div class="text-tertiary p-3 stats">
      <!-- <p>The impresso database is growing day-by-day. Currently there are </p> -->
      <p class="small-caps mt-3">Impresso data rundown</p>
      <p>
        <span class="number">29</span>
        newspapers collected,<br>
        <span class="number">1.2</span>
        billion pages scanned,<br>
        <span class="number">137</span>
        million articles identified
      </p>
      <p>
        <span class="number">5</span> languages,<br>
        <span class="number">6</span> countries of publication<br>
        <span class="number">5.2</span> named entities disambiguated
      </p>

      <div class="mb-2">
        <b-button
          :variant="showLines  ? 'primary' : 'outline-primary'" size="sm"
          @click="showLines = !showLines">
          <div v-if="showLines">{{$t('toggle_lines_on')}}</div>
          <div v-else>{{$t('toggle_lines_off')}}</div>
        </b-button>
      </div>
      <div>
        <b-button
          :variant="darkMode ? 'primary' : 'outline-primary'" size="sm"
          @click="darkMode = !darkMode">
          <div class="d-flex flex-row align-items-center">
            <div class="d-flex dripicons dripicons-brightness-medium mr-2" />
            <div v-if="darkMode">{{$t('toggle_darkmode_on')}}</div>
            <div v-else>{{$t('toggle_darkmode_off')}}</div>
          </div>
        </b-button>
      </div>
      <!-- <br>
      <viz-bar-multi title="Langues" variant="compact" :items="[{name: 'Français', count: 70}, {name: 'Deutsch', count: 20}, {name: 'English', count: 10}]" />
      <viz-bar-multi title="OCR / OLR" variant="compact" :items="[{name: 'OCR', count: 20}, {name: 'OLR', count: 80}]" />
      <viz-bar-multi title="Statistiques" variant="compact" :items="[{name: 'Ravioli', count: 110}, {name: 'Spaghetti', count: 20}, {name: 'Penne', count: 70}]" />
      <viz-bar-multi title="Autres" :items="[{name: 'ita', count: 35}, {name: 'FRançais', count: 60}, {name: 'DEutsch', count: 25}, {name: 'ENglish newsppapa', count: 10}]" />
      <viz-bar-multi :items="[{name: 'FRançais', count: 20}, {name: 'DEutsch', count: 70}, {name: 'ENglish newsppapa', count: 10}]" /> -->

      <br>
    </div>

  </i-layout-section>
  <i-layout-section :class="{ 'mt-1px ml-1px border-top border-left': showLines, 'border-tertiary': darkMode }">
    <div class="text-tertiary p-3">
      <h1 class="huge m-4 mt-2">Media Monitoring of the <span class="text-accent">Past</span></h1>
      <!-- <h1 class="text-white mt-5">Today, 100 years ago.</h1>
      This section lists front pages with the most important events. -->

      <h2 class="p-4 m-0">Mining 200 years <br/>of historical newspapers</h2>
      <p class="px-4 pb-4">
        How can newspapers help understand the past? How to explore them?
        <br>
        Some examples to get you started!
      </p>
      <recipes :dark-mode="darkMode"/>
    </div>
    <home-page-footer />
  </i-layout-section>
</i-layout>
</template>

<script>
import Autocomplete from './Autocomplete';
import SearchTabs from './modules/SearchTabs';
import VizBarMulti from './base/VizBarMulti';
import Recipes from './modules/homepage/Recipes';
import HomePageFooter from './HomePageFooter';

export default {
  props: {
    showLines: {
      type: Boolean,
      default: false,
    },
    darkMode: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    onSuggestion(suggestion) {
      this.$store.commit('search/ADD_FILTER', suggestion);
      this.search(1);
    },
    search(page) {
      if (page !== undefined) {
        this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      this.$store.dispatch('search/PUSH_SEARCH_PARAMS');
    },
  },
  components: {
    Autocomplete,
    SearchTabs,
    VizBarMulti,
    Recipes,
    HomePageFooter,
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

#HomePage2020{
  background-size: cover;
  height: 100vh;
}
.bg-dark {
  ul.nav.nav-pills .nav-item.active .nav-link {
    color: $clr-white;
    border-color: $clr-secondary;
    border-bottom-color: #343a40; // theme-color("dark")
  }

  .btn-primary,
  .input-group > .form-control, .input-group > .custom-select, .input-group > .custom-file {
    color: $clr-white;
    background-color: #343a40;
    border-color: $clr-white !important;
    &::placeholder {
      color: $clr-white;
    }
    &:hover{
      background-color: black;
    }
  }
  .btn-outline-primary {
    border-color: #73777a;
    color: #ffffff87;
    &:hover{
      border-color: $clr-white !important;
      color: $clr-white;
    }
  }
  .btn-primary {
    // border-width: 0 0 1px 0;
  }

  ul.nav.nav-pills {
    border-color: $clr-secondary;
  }
}

h1.huge {
  font-size: 800%;
  line-height: 0.9;
}
.stats span.number{
  color: #343a40;
}

.bg-dark {
  h1.huge, h2{
    color: white;
  }
  .stats span.number{
    color: white;
  }

  &.border-tertiary, .border-tertiary{
    border-color: #ffffff47 !important;
  }
}


</style>

<i18n>
{
  "en": {
    "toggle_lines_off": "lines: off",
    "toggle_lines_on": "lines: on",
    "toggle_darkmode_off": "dark mode: off",
    "toggle_darkmode_on": "dark mode: on"
  }
}
</i18n>
