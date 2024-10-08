<template>
  <div class="h-100 d-flex flex-column" @mouseleave="handleMouseleave">
    <!-- start -->
    <b-navbar-nav class="border-bottom d-flex flex-row flex-shrink-1">
      <li class="navbar-text ml-3 mr-2 py-3">
        <label>{{ $t('visualisationType') }}</label></li>
      <li class="navbar-text mr-1 py-3">
        <i-dropdown
          v-model="visualisation"
          :options="
            visualisationTypes.map(value => ({
              value,
              text: $t(`use_${value}`),
            }))
          "
          class="mr-auto"
          size="sm"
          variant="dark"
        ></i-dropdown
      ></li>
      <li
        v-if="visualisationOrderByOptions.length > 0"
        class="navbar-text border-left ml-3 pl-3 mr-2 py-3"
      >
        <label>{{ $t('visualisationOrderBy') }}</label></li>
      <li v-if="visualisationOrderByOptions.length > 0" class="navbar-text py-3">
        <i-dropdown
          v-model="visualisationOrderBy"
          :options="
            visualisationOrderByOptions.map((value: string) => ({
              value,
              text: $t(`use_orderby_${value}`),
            }))
          "
          class="mr-auto"
          size="sm"
          variant="outline-primary"
        ></i-dropdown
      ></li>
    </b-navbar-nav>
    <!-- end navbar -->
    <PowerVisBase
      class="flex-grow-1"
      :data="stats"
      :loading="statsLoading"
      @item:click="handleItemClicked"
      @mousemove="handleMousemove"
      @mouseleave="handleMouseleave"
      :options="visualisationOptions"
    >
      <template v-slot:header>
        <div class="position-relative">
          <tooltip v-if="tooltip.isActive && tooltip.item" :tooltip="tooltip">
            <div v-if="visualisationDomain === 'time'" class="border-bottom pb-1 mb-1 border-white">
              {{ $d(tooltip.item?.point?.domain, 'year') }}
            </div>
            <div v-if="['troverlap_vs_newspapers', 'trcsize_vs_newspaper'].includes(visualisation)">
              <span class="text-bold">{{ tooltip.item.point.domain.label }}</span>

              <span
                class="border-bottom d-block my-1 pb-2"
                v-html="
                  $tc('numbers.results', tooltip.item.point.value.count, {
                    n: $n(tooltip.item.point.value.count),
                  })
                "
              />
              {{ tooltip.item.valueKey }}
              <span class="number">{{
                Number(tooltip.item.point.value[tooltip.item.valueKey]).toFixed(2)
              }}</span>
            </div>
            <div v-else-if="tooltip.item.valueKey === 'items'">
              <b>{{ tooltip.item.term }}</b>
              <div
                v-html="$tc(visualisationLabel, tooltip.item.count, { n: $n(tooltip.item.count) })"
              />
            </div>
            <span v-else-if="typeof tooltip.item.valueKey === 'string'">
              {{ tooltip.item.valueKey }}
              <span class="number">{{ $n(tooltip.item.point.value[tooltip.item.valueKey]) }}</span>
            </span>
            <div v-else>
              {{ $d(tooltip.item?.point?.domain, 'year') }}<br />
              {{ tooltip.item?.term }}
              <div
                v-html="$tc(visualisationLabel, tooltip.item.count, { n: $n(tooltip.item.count) })"
              />
              <!-- <pre v-else class="text-white">{{ JSON.stringify(tooltip.item, null, 2) }}</pre> -->
            </div>
          </tooltip>
        </div>
      </template>
      <template v-slot:footer>
        <div class="p-3 " v-html="$t(`use_${visualisation}_description`)" />
      </template>
    </PowerVisBase>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'

import PowerVisBase from '@/components/modules/vis/PowerVisBase.vue'
import Tooltip from '@/components/modules/tooltips/Tooltip.vue'
import { serializeFilters, SupportedFiltersByIndex } from '@/logic/filters'
import { DefaultFacetTypesForIndex } from '@/logic/facets'
import { stats } from '@/services'
import { CommonQueryParameters } from '@/router/util'
import { Navigation } from '@/plugins/Navigation'

interface DomainValueItem {
  domain: { label: string; value: string }
  value: { count: number; items: { term: string; count: number }[] }
}

interface Data {
  meta?: any
  items?: DomainValueItem[]
  itemsDictionary?: Record<string, string>
}

type DataSorter = (data: Data) => Data

const newspaperTermSorter = (data: Data) => {
  const { items, meta, itemsDictionary } = data

  // order of the items in the domain
  const domainOrder = Object.fromEntries(
    items?.map((item, index) => {
      return [item.domain.value, index] as [string, number]
    }) ?? [],
  )

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
  return data => data
}

interface FilterLike {
  type: string
}

const NoFacetFilters = {
  search: ['string'],
  tr_clusters: [],
  tr_passages: [],
}

interface QParams {
  facet: string
  index: string
  domain: string
  groupby?: string
  unit: string
}

const StatsQueryParams = {
  trc_vs_newspapers: {
    facet: 'newspaper',
    index: 'tr_passages',
    domain: 'time',
    groupby: 'textReuseCluster',
    unit: 'numbers.clusters',
  },
  tr_vs_newspapers: {
    facet: 'newspaper',
    index: 'tr_passages',
    domain: 'time',
    unit: 'numbers.passages',
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
    orderByOptions: ['count asc', 'count desc', 'mean asc', 'mean desc', 'max asc', 'max desc'],
    options: {
      bandwidth: 40,
      transformLabels: '',
      margin: { left: 150 },
      truncateLabelsAtLength: 20,
      floatingPointPrecision: 0,
    },
  },
  troverlap_vs_newspapers: {
    facet: 'textReuseClusterLexicalOverlap',
    index: 'tr_passages',
    domain: 'newspaper',
    orderByOptions: ['count asc', 'count desc', 'mean asc', 'mean desc', 'max asc', 'max desc'],
    options: {
      bandwidth: 40,
      transformLabels: '',
      margin: { left: 150 },
      truncateLabelsAtLength: 20,
      floatingPointPrecision: 2,
    },
  },
  troverlap_vs_time: {
    facet: 'textReuseClusterLexicalOverlap',
    index: 'tr_passages',
    domain: 'time',
  },
  trnewspapers_vs_newspapers: {
    facet: 'textReuseClusterNewspapers',
    index: 'tr_passages',
    domain: 'newspaper',
    groupby: 'textReuseCluster',
  },
  // troverlap_vs_newspapers: {},
  // trdelta_vs_newspapers: {},
  // trcount_vs_newspapers: {},
  // trcount_vs_time: {},
}
const VisualisationTypes = Object.keys(StatsQueryParams)

export default defineComponent({
  name: 'TextReuseStatistics',
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
    visualisationTypes: VisualisationTypes,
    tooltip: {
      x: 0,
      y: 0,
      isActive: false,
      item: {
        term: null,
        count: 0,
      } as Record<string, any>,
    },
  }),
  setup() {
    const itemClicked = () => {}
    return { itemClicked }
  },
  methods: {
    isFilterTypeSupporedInIndex(index: keyof typeof NoFacetFilters, type: string) {
      // NOTE: daterange is the only filter type that does not have corresponding facet at the moment
      const filterTypes = DefaultFacetTypesForIndex[index].concat(['daterange'])
      return filterTypes.includes(type) && !NoFacetFilters[index].includes(type as never)
    },
    handleMousemove(event: any) {
      // if it is term, get the right label.
      const term =
        this.stats.itemsDictionary && event.point.closestItem?.term
          ? this.stats.itemsDictionary[event.point.closestItem.term]
          : event.point.closestItem?.term

      this.tooltip = {
        x: event.point.x,
        y: event.point.y + 10,
        isActive: event.point.closestValueKey !== null,
        item: {
          ...event.point.closestItem,
          term,
          valueKey: event.point.closestValueKey,
          point: event.point.closestPoint,
        },
      }
    },
    handleMouseleave() {
      console.debug('handleMouseleave')
      this.tooltip = {
        x: 0,
        y: 0,
        isActive: false,
        item: {
          term: null,
          count: 0,
        },
      }
    },
    handleItemClicked({ item }: { item: any }) {
      if (!item) return
      console.debug('handleItemClicked', item.term)
      this.selectionMonitorStore.show({
        item: {
          name: item.term,
          uid: item.term,
        },
        searchIndex: 'tr_passages',
        type: 'newspaper',
      })
    },
  },
  computed: {
    ...mapStores(useSelectionMonitorStore),
    $navigation() {
      return new Navigation(this)
    },
    // get visualisation type from URL parameters
    visualisation: {
      get(): keyof typeof StatsQueryParams {
        const { [CommonQueryParameters.VisualisationType]: visualisation } = this.$route?.query ?? {}
        // if visualisation type is undefined or not in the list of options, return the first option
        if (typeof visualisation !== 'string' || !VisualisationTypes.includes(visualisation)) {
          return VisualisationTypes[0] as keyof typeof StatsQueryParams
        }
        return visualisation as keyof typeof StatsQueryParams
      },
      set(visualisation: string) {
        this.$navigation.updateQueryParameters({
          [CommonQueryParameters.VisualisationType]: visualisation,
        })
      },
    },
    visualisationOrderByOptions() {
      return (StatsQueryParams[this.visualisation] as any).orderByOptions || []
    },
    /** return a translation label string */
    visualisationLabel() {
      const unit = (StatsQueryParams[this.visualisation] as any).unit
      if (!unit) return 'results'
      return unit
    },
    /** get visualisation domain */
    visualisationDomain() {
      return StatsQueryParams[this.visualisation].domain
    },
    /** options for current visualisation */
    visualisationOptions() {
      return (StatsQueryParams[this.visualisation] as any).options || {}
    },
    // get visualisation order by from URL parameters
    visualisationOrderBy: {
      get() {
        if (!this.visualisationOrderByOptions.length) return null
        const {
          [CommonQueryParameters.VisualisationOrderBy]: visualisationOrderBy,
        } = this.$route?.query ?? {}
        // if visualisation order by is undefined or not in the list of options, return the first option
        if (
          typeof visualisationOrderBy !== 'string' ||
          !this.visualisationOrderByOptions.includes(visualisationOrderBy)
        ) {
          return this.visualisationOrderByOptions[0]
        }
        return visualisationOrderBy
      },
      set(visualisationOrderBy: string) {
        this.$navigation.updateQueryParameters({
          [CommonQueryParameters.VisualisationOrderBy]: visualisationOrderBy,
        })
      },
    },
    statsApiQueryParameters() {
      const { index, facet, domain, groupby } = StatsQueryParams[this.visualisation] as QParams
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

      const query: Record<string, any> = {
        index,
        facet,
        domain,
        stats: 'min,max,mean',
        sort: this.visualisationOrderBy,
        filters: serializeFilters(supportedFilters),
      }
      if (groupby) {
        query['groupby'] = groupby
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
          const s: { meta?: any; items?: any[] } = await stats.find({ query })
          s.meta = s.meta || {}
          s.meta.horizontal = true
          this.stats = s
          // const statsResult = await stats.find({ query })
          // statsResult.meta = statsResult.meta || {}
          // statsResult.meta.horizontal = true

          // const toSortedItems = getSorter(statsResult.meta.domain, statsResult.meta.facetType)

          // this.stats = this.visualisation === 'trc' ? toSortedItems(statsResult):statsResult
          // // eslint-disable-next-line
          // console.debug('[TextReuseOverview] @statsApiQueryParameters \n result:', this.stats)
        } finally {
          this.statsLoading = false
        }
      },
      immediate: true,
    },
  },
})
</script>
<i18n lang="json">
{
  "en": {
    "visualisationType": "type of visualisation:",
    "visualisationOrderBy": "order By:",
    "use_tr_vs_newspapers" :"Number of text reuse passages over time, by newspaper",
    "use_tr_vs_newspapers_description": "This graph shows the number of passages of text reuse per year. Each line represents text reuse passages in a single newspaper title.",
    "use_trc_vs_newspapers" :"Number of text reuse clusters over time, by newspaper",
    "use_trc_vs_newspapers_description": "This graph shows the number of clusters of text reuse passages per year. Each line represents text reuse clusters in a single newspaper title.",
    "use_tr_vs_time": "Text Reuse over Time",
    "use_trcsize_vs_newspaper": "Median, min and max cluster size, by newspaper",
    "use_trcsize_vs_newspaper_description": "This graph shows the <b class='color-label min'>minimum</b> (blue), <b class='color-label min'>mean</b> (green) and <b class='color-label min'>maximum</b> (orange) number of text reuse passages per cluster in a given newspaper title.",
    "use_trcsize_vs_time": "Median, Min and Max cluster size over Time",
    "use_trcsize_vs_time_description": "This graph shows the <b class='color-label min'>minimum</b> (blue), <b class='color-label min'>mean</b> (green) and <b class='color-label min'>maximum</b> (orange) number of text reuse passages per cluster over time.",
    "use_troverlap_vs_newspapers" :"Text Reuse lexical Overlap between Newspaper Titles",
    "use_troverlap_vs_time": "Median, Min and Max lexical Overlap over Time",
    "use_troverlap_vs_time_description": "This graph shows the <b class='color-label min'>minimum</b> (blue), <b class='color-label min'>mean</b> (green) and <b class='color-label min'>maximum</b> (orange) lexical overlap between text reuse passages over time.",
    "use_trdelta_vs_newspapers": "Publication Time Delta per Newspaper Title",
    "use_trcount_vs_newspapers": " Sum of Passages per Newspaper Title",
    "use_trcount_vs_time": "Sum of Passages over Time",
    "use_trnewspapers_vs_newspapers": "Co-occurrence of text reuse passages between newspaper titles",
    "use_trnewspapers_vs_newspapers_description": "<b>Note: search filters are not available</b>.<br/> This graph shows the co-occurrence of text reuse passages between newspaper titles. The size of the circle represents the number of text reuse passages between the two newspaper titles. The color of the circle represents the number of clusters in which the two newspaper titles co-occur.",
    "use_orderby_count desc": "count (descending)",
    "use_orderby_count asc": "count (ascending)",
    "use_orderby_mean desc": "mean (ascending)",
    "use_orderby_mean asc": "mean (descending)",
    "use_orderby_max desc": "max (ascending)",
    "use_orderby_max asc": "max (descending)"
  }
}
</i18n>
<style lang="scss">
.TextReuseOverview_PowerVisBaseWrapper {
  overflow-y: hidden;
}
.TextReuseOverview_PowerVisBaseWrapper_stats {
  max-width: 300px;
  height: 100%;
  overflow-y: scroll;
}
.TextReuseOverview__listVisualisation {
  height: 100%;
  overflow-y: scroll;
}
</style>
