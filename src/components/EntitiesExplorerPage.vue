<template lang="html">
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light" class="border-bottom" slot="header">
        <section v-if="observingList">
          <div class="label small-caps">
            Entities
          </div>
          <h3>{{ $t('title') }}</h3>
          <div v-if="countActiveFilters > 0">
            <b-form-checkbox
              v-model="applyCurrentSearchFilters"
              switch>
              {{ $t('label.useCurrentSearch') }}
              <a @click.prevent.stop="toggleQueryExplorerVisible">
                ({{ $tc('counts.filters', countActiveFilters) }})
              </a>

            </b-form-checkbox>
            <div
              style="z-index:1"
              class="drop-shadow bg-dark position-absolute" v-if="searchQueryExplorerVisible">
              <search-query-explorer :search-query="searchQuery" dark-mode/>
            </div>
          </div>
        </section>
        <section v-else>
          <p class="pt-3">Please add a few entities and be amazed.</p>
        </section>
      </b-navbar>
    </template>
    <template v-slot:default>
      <section v-if="$route.query.items" class="p-3 border-bottom">
        <timeline
          :class="{'invisible': isLoading}"
          :values="timevalues"
          :domain="domain"
          height="120px"
          @brushed="onTimelineBrushed"
          >
          <div slot-scope="tooltipScope">
            <div v-if="tooltipScope.tooltip.item">
              {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
              <b>{{ tooltipScope.tooltip.item.w }}</b>
            </div>
          </div>
        </timeline>
      </section>
      <section>
        <time-punchcard-chart
          :data="testChartData"/>
        {{testChartData}}
      </section>
    </template>
  </i-layout-section>
</template>

<script>
import * as d3 from 'd3';

import Timeline from './modules/Timeline';
import SearchQueryExplorer from './modals/SearchQueryExplorer';
import { searchQueryGetter } from '@/logic/queryParams';
import TimePunchcardChart from '@/components/modules/vis/TimePunchcardChart';

export default {
  data: () => ({
    searchQueryExplorerVisible: false,
    useCurrentSearch: false,
    timevalues: [],
    domain: [1800, 2000],
    minDate: new Date('1800-01-01').getTime(),
    maxDate: new Date('2020-01-01').getTime(),
    testChartData: /** @type {import('@/d3-modules/TimePunchcardChart').ChartData} */ ({
      categories: [...Array(6).keys()].map((categoryIndex) => {
        let startTime = new Date('1800-01-01')
        const OneMonth = 1000 * 60 * 60 * 24 * 30
        startTime = d3.timeMonth.floor(startTime)

        return {
          dataPoints: [...Array(10).keys()].map((_, index) => {
            const value = index === 0 ? 100 : 20 + Math.random() * 80
            const time = d3.timeMonth.round(new Date(startTime + (OneMonth * index)))
            if (time.getTime() > new Date('2020-01-01').getTime()) return undefined
            return { time, value }
          }).filter(v => v != null),
          isSubcategory : categoryIndex % 2 === 1
        }
      })
    }),
  }),
  components: {
    Timeline,
    SearchQueryExplorer,
    TimePunchcardChart,
  },
  computed: {
    isLoading: {
      get() {
        return this.$store.state.entities.isLoading;
      },
      set(value) {
        this.$store.dispatch('entities/UPDATE_IS_LOADING', value);
      },
    },
    applyCurrentSearchFilters: {
      get() {
        return this.$store.state.entities.applyCurrentSearchFilters;
      },
      set(value) {
        this.$store.dispatch('entities/UPDATE_APPLY_CURRENT_SEARCH_FILTERS', value);
        this.loadFacets({type: 'entity', q: this.observingList});
      },
    },
    searchQuery: searchQueryGetter(),
    countActiveFilters() {
      return this.searchQuery.countActiveFilters();
    },
    observingList() {
      return this.$route.query.items ? this.$route.query.items.split(',') : [];
    }
  },
  methods: {
    toggleQueryExplorerVisible() {
      this.searchQueryExplorerVisible = !this.searchQueryExplorerVisible;
    },
    loadFacets({type, q}) {
      this.isLoading = true;
      let filters = [{type, q, op: 'OR'}];
      if (this.applyCurrentSearchFilters) {
        filters = filters.concat(this.searchQuery.getFilters());
      }
      console.log('___filters', filters, this.applyCurrentSearchFilters);
      return this.$store.dispatch('search/LOAD_TIMELINE', {filters}).then((values) => {
        this.timevalues = values;
        this.isLoading = false;
      });
    },
    onTimelineBrushed(data) {
      console.log(data);
      this.minDate = data.minDate.getTime();
      this.maxDate = data.maxDate.getTime();
      console.log(this.minDate);
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler() {
        this.loadFacets({type: 'entity', q: this.observingList});
      },
    },
  },
};
</script>

<style lang="css" scoped>
</style>

<i18n>
{
  "en": {
    "title": "Timeline of observed Named Entities"
  }
}
</i18n>
