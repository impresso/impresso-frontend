<template>
<i-layout id="HomePage2020" :class="{ 'pt-1px bg-light border-top': showLines, 'bg-dark border-tertiary': darkMode }" >
  <i-layout-section width="400px" :class="{ ' mr-1px border-top border-right': showLines,'border-tertiary': darkMode }">
    <!--  header -->
    <div slot="header" :class="{ 'border-bottom border-secondary': showLines }">
      <search-tabs focusOnSearch/>
      <div class="py-3 px-3">
        <autocomplete v-on:submit="onSuggestion" />
      </div>
    </div>

    <!--  body -->
    <div class="text-tertiary p-3 stats">
      <!-- <p>The impresso database is growing day-by-day. Currently there are </p> -->
      <p class="small-caps mt-3">Impresso data rundown</p>
      <p>
        <span class="number">76</span>
        newspapers collected,<br>
        <span class="number"> 600,919</span>
        issues,<br>
        <span class="number">5,429,656</span>
         pages scanned,<br>
        <span class="number">47,798,468</span>
         content items identified,<br>
         <span class="number"> 3,462,799</span>
          images,<br>
        <span class="number">12,493,358,703</span>
        words.<br>
      </p>
      <p>
        <span class="number">2</span> countries of publication<br>
        <span class="number">530,086</span> named entities disambiguated
      </p>
      <p>More? Check on our <a class="text-white" href="https://impresso-project.ch/news/2020/01/23/state-corpus-january2020.html">blog</a></p>
      <p>
        info @ impresso-project [dot] ch<br/>
        project website: <a href="/" target="_blank">impresso-project.ch</a> <br/>
        github: <a href="https://github.com/impresso" target="_blank">impresso</a><br/>
        twitter: <a href="https://twitter.com/ImpressoProject" target="_blank">@impressoproject</a><br/>

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
  <i-layout-section :class="{ ' ml-1px border-top border-left': showLines, 'border-tertiary': darkMode }">
    <div class="text-tertiary p-3">
      <h1 class="huge m-4 my-2">Media Monitoring of the <span class="text-accent">Past</span></h1>
      <!-- <h1 class="text-white mt-5">Today, 100 years ago.</h1>
      This section lists front pages with the most important events. -->

      <h2 class="p-4 m-0">Mining 200 years <br/>of historical newspapers <info-button name="which-newspapers" class="ml-2 mt-1 d-inline-block" /></h2>
      <section class="mx-4">
        <p>
          How can newspapers help understand the past? How to explore them?
        </p>
        <p class="p-3 my-3" style="background-color: #3e454c; font-size: 0.9em">
          For legal reasons not all content is available in Open Access.
          <br/> To gain full access, simply sign this
          <a class="text-white" href="https://impresso-project.ch/assets/documents/impresso_NDA.pdf" target="_self"> Non-Disclosure-Agreement</a>
          and email it to <a class="text-white" href="mailto:info@impresso-project.ch">info@impresso-project.ch</a>
        </p>
        <p class='text-center text-white'>
          ... then here are a few examples to get you started!
        </p>
      </section>
      <div class="border-bottom" style="position:relative">
        <div class="arrow-down" style="position:absolute; left:50%; margin-left: -20px; top: -1px; border-top-color: #343a40"></div>
      </div>
      <div class="arrow-down mx-auto"></div>
      <recipes :dark-mode="darkMode" class="mt-2"/>
    </div>
    <home-page-footer />
  </i-layout-section>
</i-layout>
</template>

<script>
import Autocomplete from './Autocomplete';
import SearchTabs from './modules/SearchTabs';
import Recipes from './modules/homepage/Recipes';
import HomePageFooter from './HomePageFooter';
import InfoButton from './base/InfoButton';

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
      this.search();
    },
    search() {
      const searchQuery = this.$store.getters['search/getSearch'];
      const query = searchQuery.getSerialized();
      console.info('search() ', query);

      this.$router.push({
        name: 'search',
        query,
      });
    },
  },
  components: {
    Autocomplete,
    SearchTabs,
    Recipes,
    HomePageFooter,
    InfoButton,
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

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
    border-color: #caccce;
    color: #caccce;
    &:hover{
      border-color: $clr-white !important;
      color: $clr-white;
    }
  }

  ul.nav.nav-pills {
    border-color: $clr-secondary;
  }

  .stats a {
    color: $clr-white;
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

.arrow-down {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;

  border-top: 20px solid #fff;
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
