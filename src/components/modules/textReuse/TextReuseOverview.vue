<template>
  <PowerVisBase
    :data="stats"
    :loading="statsLoading"
    @item:click="itemClicked"
    @mousemove="handleMousemove"
  >
    <template v-slot:header>
      <b-navbar-nav class="border-bottom d-flex flex-row">
        <b-nav-text class="ml-3 mr-2 py-3">
          <label>{{ $t('visualisationType') }}</label></b-nav-text
        >
        <b-nav-text class="mr-1 py-3">
          <i-dropdown
            v-model="visualisation"
            :options="
              visualisationOptions.map(value => ({
                value,
                text: $t(`use_${value}`),
              }))
            "
            class="mr-auto"
            size="sm"
            variant="outline-primary"
          ></i-dropdown
        ></b-nav-text>
        <b-nav-text
          v-if="visualisationOrderByOptions.length > 0"
          class="border-left ml-3 pl-3 mr-2 py-3"
        >
          <label>{{ $t('visualisationOrderBy') }}</label></b-nav-text
        >
        <b-nav-text v-if="visualisationOrderByOptions.length > 0" class=" py-3">
          <i-dropdown
            v-model="visualisationOrderBy"
            :options="
              visualisationOrderByOptions.map(value => ({
                value,
                text: $t(`use_orderby_${value}`),
              }))
            "
            class="mr-auto"
            size="sm"
            variant="outline-primary"
          ></i-dropdown
        ></b-nav-text>
      </b-navbar-nav>
      <div class="position-relative">
        <tooltip :tooltip="tooltip">
          {{ $d(tooltip.item?.point?.domain, 'year') }}<br />
          <span v-if="tooltip.item && tooltip.item?.term">
            {{ tooltip.item?.term }} <span class="number">{{ tooltip.item?.count }}</span>
          </span>
          <span v-else-if="typeof tooltip.item.valueKey === 'string'">
            {{ tooltip.item.valueKey }}
            <span class="number">{{ tooltip.item.point.value[tooltip.item.valueKey] }}</span>
          </span>
          <pre v-else class="text-white">{{ JSON.stringify(tooltip.item, null, 2) }}</pre>
        </tooltip>
      </div>
    </template>
    <template v-slot:footer>
      <div>TextReuseOverview Footer</div>
    </template>
  </PowerVisBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PowerVisBase from '@/components/modules/vis/PowerVisBase.vue'
import Tooltip from '@/components/modules/tooltips/Tooltip.vue'
import { serializeFilters } from '@/logic/filters'
import { DefaultFacetTypesForIndex } from '@/logic/facets'
import { stats } from '@/services'
import { CommonQueryParameters } from '@/router/util'

interface FilterLike {
  type: string
}

const NoFacetFilters = {
  search: ['string'],
  tr_clusters: [],
  tr_passages: [],
}

const StatsQueryParams = {
  tr_vs_newspapers: {
    facet: 'newspaper',
    index: 'tr_passages',
    domain: 'time',
  },
  trcsize_vs_time: {
    facet: 'textReuseClusterSize',
    index: 'tr_passages',
    domain: 'time',
  },
  trcsize_vs_newspaper: {
    facet: 'textReuseClusterSize',
    index: 'tr_passages',
    domain: 'newspaper',
    orderByOptions: ['count asc', 'count desc'],
  },
  troverlap_vs_time: {
    facet: 'textReuseClusterLexicalOverlap',
    index: 'tr_passages',
    domain: 'time',
  },
  trnewspapers_vs_newspapers: {
    facet: 'newspaper',
    index: 'tr_clusters',
    domain: 'newspaper',
  },
  // troverlap_vs_newspapers: {},
  // trdelta_vs_newspapers: {},
  // trcount_vs_newspapers: {},
  // trcount_vs_time: {},
}
const VisualisationOptions = Object.keys(StatsQueryParams)

export default defineComponent({
  name: 'TextReuseOverview',
  components: {
    PowerVisBase,
    Tooltip,
  },
  props: {
    filters: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    items: [],
    stats: {},
    statsLoading: false,
    visualisationOptions: VisualisationOptions,
    tooltip: {
      x: 0,
      y: 0,
      isActive: true,
      item: {
        term: null,
        count: 0,
      },
    },
  }),
  setup() {
    const itemClicked = () => {}
    return { itemClicked }
  },
  methods: {
    /**
     * @param {string} index
     * @param {string} type
     * @returns {boolean}
     */
    isFilterTypeSupporedInIndex(index, type) {
      // NOTE: daterange is the only filter type that does not have corresponding facet at the moment
      const filterTypes = DefaultFacetTypesForIndex[index].concat(['daterange'])
      return filterTypes.includes(type) && !NoFacetFilters[index].includes(type)
    },
    handleMousemove(event) {
      const { x, y } = event
      this.tooltip = {
        x: event.point.x,
        y: event.point.y + 10,
        isActive: true,
        item: {
          ...event.point.closestItem,
          valueKey: event.point.closestValueKey,
          point: event.point.closestPoint,
        },
      }
    },
  },
  computed: {
    // get visualisation type from URL parameters
    visualisation: {
      get() {
        const { [CommonQueryParameters.VisualisationType]: visualisation } = this.$route?.query
        // if visualisation type is undefined or not in the list of options, return the first option
        if (typeof visualisation !== 'string' || !VisualisationOptions.includes(visualisation)) {
          return VisualisationOptions[0]
        }
        return visualisation
      },
      set(visualisation) {
        this.$navigation.updateQueryParameters({
          [CommonQueryParameters.VisualisationType]: visualisation,
        })
      },
    },
    visualisationOrderByOptions() {
      return StatsQueryParams[this.visualisation].orderByOptions || []
    },
    // get visualisation order by from URL parameters
    visualisationOrderBy: {
      get() {
        if (!this.visualisationOrderByOptions.length) return null
        const {
          [CommonQueryParameters.VisualisationOrderBy]: visualisationOrderBy,
        } = this.$route?.query
        // if visualisation order by is undefined or not in the list of options, return the first option
        if (
          typeof visualisationOrderBy !== 'string' ||
          !this.visualisationOrderByOptions.includes(visualisationOrderBy)
        ) {
          return this.visualisationOrderByOptions[0]
        }
        return visualisationOrderBy
      },
      set(visualisationOrderBy) {
        this.$navigation.updateQueryParameters({
          [CommonQueryParameters.VisualisationOrderBy]: visualisationOrderBy,
        })
      },
    },
    statsApiQueryParameters() {
      const { index, facet, domain } = StatsQueryParams[this.visualisation]
      const filters = this.filters as FilterLike[]
      const supportedFilters = filters.filter(({ type }) =>
        this.isFilterTypeSupporedInIndex(index, type),
      )

      const query = {
        index,
        facet,
        domain,
        sort: this.visualisationOrderBy,
        filters: serializeFilters(supportedFilters),
      }
      return {
        query,
        hash: JSON.stringify(query)
          .split('')
          .sort()
          .join(''),
      }
    },
  },
  watch: {
    statsApiQueryParameters: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug(
          '[TextReuseOverview] @statsApiQueryParameters \n query:',
          query,
          hash,
          previousValue,
        )
        try {
          this.statsLoading = true
          this.stats = await stats.find({ query })
          // eslint-disable-next-line
          console.debug('[TextReuseOverview] @statsApiQueryParameters \n result:', this.stats)
        } finally {
          this.statsLoading = false
        }
      },
      immediate: true,
    },
  },
})
</script>
<i18n>
{
  "en": {
    "visualisationType": "type of visualisation:",
    "visualisationOrderBy": "order By:",
    "use_tr_vs_newspapers" :"Text Reuse between Newspaper Titles",
    "use_tr_vs_time": "Text Reuse over Time",
    "use_trcsize_vs_newspapers": "Cluster Sizes per Newspaper Title",
    "use_trcsize_vs_time": "Cluster Sizes over Time",
    "use_troverlap_vs_newspapers" :"Text Reuse lexical Overlap between Newspaper Titles",
    "use_troverlap_vs_time": "Lexical Overlap over Time",
    "use_trdelta_vs_newspapers": "Publication Time Delta per Newspaper Title",
    "use_trcount_vs_newspapers": " Sum of Passages per Newspaper Title",
    "use_trcount_vs_time": "Sum of Passages over Time",
    "use_trnewspapers_vs_newspapers": "Co-occurrence of text reuse passages between newspaper titles",
    "use_orderby_count desc": "count (descending)",
    "use_orderby_count asc": "count (ascending)"
  }
}
</i18n>
