<template>
<i-layout id="HomePage2020" :class="{ 'pt-1px bg-light border-top': showLines, 'bg-dark border-tertiary': darkMode }" >
  <i-layout-section width="400px" :class="{ ' mr-1px border-top border-right': showLines,'border-tertiary': darkMode }">
    <!--  header -->
    <div slot="header" :class="{ 'border-bottom border-secondary': showLines }">
      <search-tabs focusOnSearch/>
      <div class="py-3 px-3">
        <search-pills
        :filters="enrichedFilters"
        @changed="handleFiltersChanged"
        />
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

      <div class="pl-3 my-3 border-left" style="border-width: 2px !important;">
        info @ impresso-project [dot] ch
        <br/>
        project website: <a href="/" target="_blank">impresso-project.ch</a>
        <br/>
        <img src="@/assets/img/GitHub-Mark-Light-32px.png" class="mr-2" style="max-height:1em"> github: <a href="https://github.com/impresso" target="_blank">impresso</a>
        <br/>
        <img src="@/assets/img/Twitter_Logo_WhiteOnImage.png" class="mr-2" style="max-height:1em"> twitter: <a href="https://twitter.com/ImpressoProject" target="_blank">@impressoproject</a>
      </div>
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
      <h1 class="huge m-4 my-2">Media Monitoring <br/>of the <span class="text-accent">Past</span></h1>
      <!-- <h1 class="text-white mt-5">Today, 100 years ago.</h1>
      This section lists front pages with the most important events. -->

      <h2 class="p-4 m-0">Mining 200 years <br/>of historical newspapers <info-button name="which-newspapers" class="ml-2 mt-1 d-inline-block" /></h2>
      <section class="mx-4">
        <p style="font-size:1.2em">
          How can newspapers help understand the past? How to explore them?
        </p>
        <div class="p-3 mb-3 mt-5 enhance-contents position-relative">
          <div class="starburst-mask">
            <div class="starburst-wrapper">
              <div class="position-absolute text">
                Gain full Access for <b>free</b>!<br/>
                <div class="dripicons-jewel"></div>
              </div>
              <div class="position-absolute rotating">
                <div class="starburst example" id="example-2"><span>&nbsp;</span></div>
              </div>
            </div>
          </div>

          <p>
            For legal reasons not all content is available in Open Access.
            <br/> To <b class="text-white">gain full access</b>:

          </p>
          <b-button :variant="darkMode ? 'primary' : 'outline-primary'" size="sm"
            href="https://impresso-project.ch/assets/documents/impresso_NDA.pdf" target="_self">
            <div class="d-flex flex-row align-items-center">
              <div class="d-flex dripicons dripicons-download mr-2" />
              <div>{{$t('download_nda')}}</div>
            </div>
          </b-button>
          <p class="mb-0 mt-3">
            ... and return the signed form to <a class="text-white" href="mailto:info@impresso-project.ch" target="_self">info@impresso-project.ch</a>
          </p>
        </div>

        <b-container class="challenges my-4 enhance-contents border-0 p-0">
          <b-row class="p-0">
          <b-col lg="6" md="12">
            <img src="./../assets/img/challenges-screenshot.png" class="w-100" alt="impresso challenges">
          </b-col>
          <b-col lg="6" md="12">
            <div class="py-3 pr-3">
              <h3 :class="{ 'text-white': darkMode }"><i class="pb-3">Impresso Challenges</i></h3>
              <p :class="{ 'text-white': darkMode }"><b>How to explore the newspapers with persons or locations? <br>What are topics good for? <br>What elements can be compared? </b></p>
              <p>Get a better understanding of this interfaces’ features and how they can interact with 3 challenges, starting with an initiation and leading to an expert level use of the interface.</p>
              <b-button :variant="darkMode ? 'primary' : 'outline-primary'" size="sm"
                href="./../assets/impresso-challenges-1.2.3.pdf" target="_blank">
                <div class="d-flex flex-row align-items-center">
                  <div class="d-flex dripicons dripicons-download mr-2" />
                  <div>download challenges <b-badge pill variant="secondary" class="ml-1">PDF</b-badge></div>
                </div>
              </b-button>
            </div>
          </b-col>
        </b-row>
      </b-container>
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
import SearchPills from '@/components/SearchPills';
import Recipes from './modules/homepage/Recipes';
import HomePageFooter from './HomePageFooter';
import InfoButton from './base/InfoButton';
import { filtersItems as filtersItemsService } from '@/services';
import {
  searchQueryGetter,
  searchQueryHashGetter,
} from '@/logic/queryParams';
import {
  optimizeFilters,
  serializeFilters,
  joinFiltersWithItems,
} from '@/logic/filters';
// import SearchQuery from '@/models/SearchQuery';

const AllowedFilterTypes = [
  'accessRight',
  'collection',
  'country',
  'isFront',
  'issue',
  'language',
  'location',
  'newspaper',
  'newspaper',
  'partner',
  'person',
  'string',
  'title',
  'topic',
  'type',
  'year',
  'daterange'
];

export default {
  data: () => ({
    /** @type {Filter[]} */
    filtersWithItems: [],
  }),
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
  computed: {
    searchQuery: searchQueryGetter(),
    searchQueryHash: searchQueryHashGetter(),
    /** @returns {Filter[]} */
    enrichedFilters() {
      return this.filtersWithItems.length
        ? this.filtersWithItems
        : this.filters
    },
    /** @returns {Filter[]} */
    ignoredFilters() {
      return this.searchQuery.filters
        .filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    /** @returns {Filter[]} */
    filters() {
      // filter by type
      return this.searchQuery.filters
        .filter(({ type }) => AllowedFilterTypes.includes(type))
    },
    searchServiceQuery() {
      const query = {
        filters: this.filters.map(d => d.getQuery()),
      };
      return query;
    },
  },
  methods: {
    handleFiltersChanged(filters) {
      const sq = serializeFilters(optimizeFilters(filters).concat(this.ignoredFilters));
      this.$router.push({
        name: 'search',
        query: {
          sq,
        },
      });
    },
    onSuggestion(filter) {
      this.handleFiltersChanged(this.filters.concat([ filter ]));
    },
  },
  watch: {
    searchServiceQuery: {
      handler({ filters }) {
        if (!filters.length) {
          return;
        }
        console.info('@searchServiceQuery oad items!!!', filters);
        filtersItemsService.find({
          query: {
            filters: this.searchQueryHash,
          },
        })
          .then(joinFiltersWithItems)
          .then((filtersWithItems) => {
            console.info('@searchServiceQuery oad filtersWithItems!!!', filtersWithItems);
            this.filtersWithItems = filtersWithItems;
          });
      },
      immediate: true,
    },
  },
  components: {
    Autocomplete,
    SearchTabs,
    Recipes,
    HomePageFooter,
    InfoButton,
    SearchPills,
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

    .nav-item .nav-link{
      color: #bec0c2;
    }
  }

  .search-pill span.label.sp-string, .search-pill span.label > .sp-string{
    color: black;
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
  .enhance-contents {
    background-color: #3e454c;
    font-size: 1em;
    border-left: 2px solid #F4D062;
  }
}

.arrow-down {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;

  border-top: 20px solid #fff;
}

.starburst {
  background-color: #eb5543;
  width: 6rem;
  height: 6rem;
  text-align: center;
  color: #fff;
  transform: rotate(-45deg);
  transition: background-color .5s ease-in-out;
}
.starburst,
.starburst span {
  display: flex;
  align-items: center;
  justify-content: center;
}

.starburst span {
  width: 100%;
  height: 100%;
  background: inherit;
  transform: rotate(45deg);
}

.starburst:before,
.starburst:after ,
.starburst span:before,
.starburst span:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
  z-index: -1;
  transform: rotate(30deg);
}

.starburst:after {
  transform: rotate(-30deg);
}

.starburst span:after {
  transform: rotate(30deg);
}
.starburst span:before {
  transform: rotate(-30deg);
}

.starburst-mask {
  position:absolute;
  top: -12rem;
  left: 5rem;
  margin-left: -6rem;
  height:12rem;
  width: 12rem;
  overflow: hidden;
  background: transparent;

  .starburst-wrapper {
    pointer-events: none;
    position: absolute;
    bottom: .5rem;
    left: 50%;
    margin-left: -3rem;
    transition: transform .6s cubic-bezier(.8,-.5,.2,1.4);
  }

  .starburst-wrapper .text{
    color: black;
    font-size: 1em;
    z-index: 1;
    font-variant: all-small-caps;
    width: 6rem;
    /* background: white; */
    height: 6rem;
    line-height: 1em;
    text-align: center;
    transform: rotate(-5deg);
    border-radius: 50%;
    padding-top: 1.15rem;
  }
  &:hover {
    .starburst-wrapper {
      transform: translateY(-5rem);
    }
    .starburst {
      background-color: #F4D062;
    }
  }
}
.enhance-contents:hover {
  .starburst-wrapper {
    transform: translateY(-5rem);
  }
  .starburst {
    background-color: #F4D062;
  }
}

@-webkit-keyframes rotating {
  // safari and chrome
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.rotating {
  animation: rotating 15s linear infinite;
}
</style>

<i18n>
{
  "en": {
    "toggle_lines_off": "lines: off",
    "toggle_lines_on": "lines: on",
    "toggle_darkmode_off": "dark mode: off",
    "toggle_darkmode_on": "dark mode: on",
    "download_nda": "download Non-Disclosure-Agreement form"
  }
}
</i18n>
