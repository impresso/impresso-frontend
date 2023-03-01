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
      <div class="p-3" v-html="$t(`use_${visualisation}_description`)" />
    </template>
  </PowerVisBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PowerVisBase from '@/components/modules/vis/PowerVisBase.vue'
import Tooltip from '@/components/modules/tooltips/Tooltip.vue'
import { serializeFilters, SupportedFiltersByIndex } from '@/logic/filters'
import { DefaultFacetTypesForIndex } from '@/logic/facets'
import { stats } from '@/services'
import { CommonQueryParameters } from '@/router/util'

interface DomainValueItem {
  domain: { label: string, value: string }
  value: { count: number, items: { term: string, count: number }[] }
}

interface Data { meta?: any; items?: DomainValueItem[], itemsDictionary?: Record<string, string> }

type DataSorter = (data: Data) => Data

const newspaperTermSorter = (data: Data) => {
  const { items, meta, itemsDictionary } = data

  // order of the items in the domain
  const domainOrder = Object.fromEntries(items?.map((item, index) => {
    return [item.domain.value, index] as [string, number]
  }) ?? [])

  // iterate over the items and sort the value items to match the domain order
  const fullySortedItems = items?.map(item => {
    const { domain, value } = item
    const valueItems = value.items

    const sortedValueItems = valueItems?.sort((a, b) => {
      const aDomainOrder = domainOrder[a.term] ?? 0
      const bDomainOrder = domainOrder[b.term] ?? 0
      return aDomainOrder - bDomainOrder
    })

    return { domain, value: { ...value, items: sortedValueItems } }
  })

  return { meta, items: fullySortedItems, itemsDictionary }
}

const getSorter = (domain: string, facetType: string): DataSorter => {
  if (domain === 'newspaper' && facetType == 'term') return newspaperTermSorter
  return (data) => data
}

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
  // tr_vs_collections: {
  //   facet: 'collection',
  //   index: 'tr_passages',
  //   domain: 'time',
  // },
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
    stats: {} as Data,
    statsLoading: false,
    visualisationOptions: VisualisationOptions,
    tooltip: {
      x: 0,
      y: 0,
      isActive: false,
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
        isActive: event.point.closestValueKey !== null,
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
      const supportedFilterTypes = SupportedFiltersByIndex[index]
      const filters = this.filters as FilterLike[]
      const supportedFilters = filters.filter(({ type }) => supportedFilterTypes.includes(type))

      // eslint-disable-next-line
      console.info(
        '@statsApiQueryParameters check filters:',
        filters,
        '\n - using index:',
        index,
        '\n - supportedFilterTypes:',
        supportedFilterTypes,
        '\n - supportedFilters:',
        supportedFilters,
      )

      const query = {
        index,
        facet,
        domain,
        stats: 'min,max,mean',
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
          // hash,
          // previousValue,
        )
        try {
          this.statsLoading = true
          const statsResult = await stats.find({ query })
          statsResult.meta = statsResult.meta || {}
          statsResult.meta.horizontal = true

          const toSortedItems = getSorter(statsResult.meta.domain, statsResult.meta.facetType)

          this.stats = toSortedItems(statsResult)
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
    "use_tr_vs_newspapers" :"Number of text reuse over time, by newspaper",
    "use_tr_vs_newspapers_description": "This graph shows the number of passages of text reuse per year. Each line represents text reuse passages in a single newspaper title.",
    "use_tr_vs_time": "Text Reuse over Time",
    "use_trcsize_vs_newspaper": "Median, min and max cluster size, by newspaper",
    "use_trcsize_vs_newspaper_description": "This graph shows the median, minimum and maximum number of text reuse passages per cluster in a given newspaper title.",
    "use_trcsize_vs_time": "Median, Min and Max cluster size over Time",
    "use_trcsize_vs_time_description": "This graph shows the median number of text reuse passages per cluster over time.",
    "use_troverlap_vs_newspapers" :"Text Reuse lexical Overlap between Newspaper Titles",
    "use_troverlap_vs_time": "Median, Min and Max lexical Overlap over Time",
    "use_troverlap_vs_time_description": "This graph shows the median, minimum and maximum lexical overlap between text reuse passages over time.",
    "use_trdelta_vs_newspapers": "Publication Time Delta per Newspaper Title",
    "use_trcount_vs_newspapers": " Sum of Passages per Newspaper Title",
    "use_trcount_vs_time": "Sum of Passages over Time",
    "use_trnewspapers_vs_newspapers": "Co-occurrence of text reuse passages between newspaper titles",
    "use_trnewspapers_vs_newspapers_description": "<b>Note: search filters are not available</b>.<br/> This graph shows the co-occurrence of text reuse passages between newspaper titles. The size of the circle represents the number of text reuse passages between the two newspaper titles. The color of the circle represents the number of clusters in which the two newspaper titles co-occur.",
    "use_orderby_count desc": "count (descending)",
    "use_orderby_count asc": "count (ascending)"
  }
}
</i18n>
