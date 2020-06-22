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
          @brush-end="onTimelineBrushed">
          <div slot-scope="tooltipScope">
            <div v-if="tooltipScope.tooltip.item">
              {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
              <b>{{ tooltipScope.tooltip.item.w }}</b>
            </div>
          </div>
        </timeline>
      </section>
      <section>
        <time-punchcard-chart :data="punchcardChartData">
          <template slot slot-scope="{ category, index }">
            <div :class="`label ${category.isSubcategory ? 'sub' : ''}`">
              <div :style="{ float: 'left' }" v-if="!category.isSubcategory">
                <button :style="{ border: 'none', padding: 0, margin: 0 }"
                        :click="() => handleEntityLabelClicked(entitiesList[index])">
                  <span class="dripicons-cross"></span>
                </button>
              </div>
              {{ category.label }} {{ index }} {{ entitiesList[index].wikidataId }}
            </div>
          </template>
        </time-punchcard-chart>
      </section>
    </template>
  </i-layout-section>
</template>

<script>
import Timeline from '@/components/modules/Timeline'
import SearchQueryExplorer from '@/components/modals/SearchQueryExplorer'
import { searchQueryGetter } from '@/logic/queryParams'
import TimePunchcardChart from '@/components/modules/vis/TimePunchcardChart'
import {
  entityMentionsTimeline as entityMentionsTimelineService
} from '@/services'

/**
 * @typedef {import('@/models').Filter} Filter
 */

const QueryParameters = Object.freeze({
  ApplyCurrentSearchFilters: 'doFilter',
  SelectedEntitiesIds: 'items'
})

/**
 * @param {any} item
 * @param {boolean} isSubcategory
 * @returns {import('@/d3-modules/TimePunchcardChart').ChartCategory}
 */
function mentionsFrequenciesResponseItemToPunchcardChartCategory(item, isSubcategory = false) {
  const dataPoints = item.mentionFrequencies.map(({ val, count }) => {
    return {
      value: count,
      time: new Date(String(val))
    };
  });

  return {
    label: item.label,
    isSubcategory,
    dataPoints
  }
}


/**
 * @param {any} response
 * @returns {import('@/d3-modules/TimePunchcardChart').ChartCategory[]}
 */
function mentionsFrequenciesResponseToPunchcardChartCategories(response) {
  const { item, subitems = [] } = response

  return [mentionsFrequenciesResponseItemToPunchcardChartCategory(item)]
    .concat(subitems.map(i => mentionsFrequenciesResponseItemToPunchcardChartCategory(i, true)))
}

export default {
  data: () => ({
    isTimelineLoading: false,
    isPunchcardLoading: false,
    searchQueryExplorerVisible: false,
    useCurrentSearch: false,
    timevalues: [],
    mentionsFrequenciesResponses: /** @type {any[]} */ ([]),
    timelineSpan: /** @type {Date[]} */ ([]),
    currentTimelineSelectionSpan:  /** @type {Date[]} */ ([]),
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
    },
    /** @returns {any} */
    punchcardUpdateParameters() {
      return {
        entitiesIds: this.observingList,
        applyCurrentSearchFilters: this.applyCurrentSearchFilters,
        currentTimelineSelectionSpan: this.currentTimelineSelectionSpan
      };
    },
    /**
     * @returns {import('@/d3-modules/TimePunchcardChart').ChartData}
     */
    punchcardChartData() {
      const categories = this.mentionsFrequenciesResponses.reduce((acc, response) => {
        const items = mentionsFrequenciesResponseToPunchcardChartCategories(response);
        return acc.concat(items);
      }, [])

      return { categories }
    },
    /** @returns {any[]} */
    entitiesList() {
      return this.mentionsFrequenciesResponses.reduce((acc, response) => {
        const { item, subitems = [] } = response;
        return acc.concat(item).concat(subitems);
      }, [])
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
    async loadPunchcardData() {
      const currentSearchFilters = this.applyCurrentSearchFilters
        ? this.searchQuery.getFilters()
        : []


      const timeFilter = /** @type {Filter[]} */ (this.currentTimelineSelectionSpan.length > 0
        ? [{
          type: 'daterange',
          // TODO: the daterange filter has a weird notion of ISO datetime format. It doesn't accept milliseconds.
          q: this.currentTimelineSelectionSpan.map(d => d.toISOString().replace(/\.\d+Z/, 'Z')).join(' TO ')
        }] : [])

      const filters = timeFilter.concat(currentSearchFilters)

      const payloads = this.observingList.map(entityId => ({
        entityId,
        filters
      }));

      try {
        this.isPunchcardLoading = true
        this.mentionsFrequenciesResponses = await Promise.all(
          payloads.map(payload => entityMentionsTimelineService.create(payload))
        )
      } finally {
        this.isPunchcardLoading = false
      }
    },
    handleEntityLabelClicked(entity) {
      console.info('*** Entity should be removed', entity);
    }
  },
  watch: {
    timelineUpdateParameters: {
      immediate: true,
      deep: true,
      async handler(newValues, oldValues) {
        if (JSON.stringify(newValues) === JSON.stringify(oldValues)) return;
        await this.loadTimeline();
      },
    },
    punchcardUpdateParameters: {
      immediate: true,
      deep: true,
      async handler(newValues, oldValues) {
        if (JSON.stringify(newValues) === JSON.stringify(oldValues)) return;
        await this.loadPunchcardData();
      }
    }
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
