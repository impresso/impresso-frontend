<template>
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
          :class="{'invisible': isTimelineLoading}"
          :values="timevalues"
          :domain="timelineSpan"
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

/**
 * @typedef {import('@/models').Filter} Filter
 */

const QueryParameters = Object.freeze({
  ApplyCurrentSearchFilters: 'doFilter',
  SelectedEntitiesIds: 'items'
})

export default {
  data: () => ({
    isTimelineLoading: false,
    searchQueryExplorerVisible: false,
    useCurrentSearch: false,
    timevalues: [],
    timelineSpan: /** @type {Date[]} */ ([]),
    currentTimelineSelectionSpan:  /** @type {Date[]} */ ([]),
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
  mounted() {
    // @ts-ignore
    let { firstDate } = window.impressoDocumentsDateSpan
    const lastDate = new Date()
    firstDate = new Date(firstDate)

    this.timelineSpan = [
      firstDate.getFullYear(),
      lastDate.getFullYear()
    ];
  },
  computed: {
    applyCurrentSearchFilters: {
      /** @returns {boolean} */
      get() {
        return /** @type {boolean} */ (this.$route.query[QueryParameters.ApplyCurrentSearchFilters] === 'true');
      },
      /** @param {boolean} value */
      set(value) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.ApplyCurrentSearchFilters]: String(value)
        })
      },
    },
    searchQuery: searchQueryGetter(),
    /** @returns {number} */
    countActiveFilters() {
      return this.searchQuery.countActiveFilters();
    },
    /** @returns {string[]} */
    observingList() {
      const items = /** @type {string} */ (this.$route.query[QueryParameters.SelectedEntitiesIds])
      return items != null ? items.split(',') : []
    },
    /** @returns {any} */
    timelineUpdateParameters() {
      return {
        entitiesIds: this.observingList,
        applyCurrentSearchFilters: this.applyCurrentSearchFilters
      };
    }
  },
  methods: {
    toggleQueryExplorerVisible() {
      this.searchQueryExplorerVisible = !this.searchQueryExplorerVisible;
    },
    async loadTimeline() {
      const observedItemsFilters = /** @type {Filter[]} */ (this.observingList.length > 0
        ? [{
          type: 'entity',
          op: 'OR',
          q: this.observingList
        }]
        : [])

      const currentSearchFilters = this.applyCurrentSearchFilters
        ? this.searchQuery.getFilters()
        : []

      const filters = observedItemsFilters.concat(currentSearchFilters)

      try {
        this.isTimelineLoading = true;
        this.timevalues = await this.$store.dispatch('search/LOAD_TIMELINE', {filters})
      } finally {
        this.isTimelineLoading = false;
      }
    },
    /** @param {any} data */
    onTimelineBrushed(data) {
      this.currentTimelineSelectionSpan = [
        data.minDate,
        data.maxDate
      ]
    },
  },
  watch: {
    timelineUpdateParameters: {
      immediate: true,
      deep: true,
      async handler(newValues, oldValues) {
        if (JSON.stringify(newValues) === JSON.stringify(oldValues)) return;
        this.loadTimeline();
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
