<template>
  <i-layout id="SearchQueriesComparisonPage">
    <i-layout-section main class="border-top">
      <template v-slot:header>
        <div class="header row pm-fixer bg-light">
          <div class="one-third" v-for="(queryResult, queryIdx) in queriesResults" :key="queryIdx">
            <query-header-panel
              :left="queryIdx === 0"
              :comparison-options="['intersection']"
              :mode-options="['inspect', 'compare']"
              :mode="mode"
              :comparable="comparableForQuery(queryIdx)"
              :total="queryResult.total"
              :title="queryResult.title"
              :collections="collections"
              @mode-changed="onModeUpdated"
              @comparable-changed="comparable => onComparableUpdated(queryIdx, comparable)"
            />
          </div>
        </div>
      </template>
      <!-- body -->
      <div class="aspects-container container-fluid">
        <!-- this component contains the three columns (show timeline only) -->
        <side-by-side-facets-panel
          :facets="sideBySideTimelineFacets"
          :comparable-loading-flags="loadingFlags"
          @insert-recent-search-query="handleInsertRecentSearchQuery"
        />

        <div class="d-flex justify-content-center p-4" v-if="mode === modes.Compare">
          <!-- scale -->
          <b-dropdown size="sm" variant="outline-primary" class="pr-1">
            <template v-slot:button-content>
              <span>{{ $t('scale') }}: {{ $t(`scales.${scale}`) }}</span>
            </template>
            <b-dropdown-item v-for="s in scales" :key="s" :active="s === scale" @click="scale = s">
              {{ $t(`scales.${s}`) }}
            </b-dropdown-item>
          </b-dropdown>

          <!-- sorting method -->
          <b-dropdown size="sm" variant="outline-primary">
            <template v-slot:button-content>
              <span>{{ $t('sortBy') }} {{ $t(`sortingMethods.${barSortingMethod}`) }}</span>
            </template>
            <b-dropdown-item
              v-for="sortingMethod in sortingMethods"
              :key="sortingMethod"
              :active="sortingMethod === barSortingMethod"
              @click="barSortingMethod = sortingMethod"
            >
              {{ $t(`sortingMethods.${sortingMethod}`) }}
            </b-dropdown-item>
          </b-dropdown>
        </div>

        <div v-if="mode === modes.Compare">
          <diverging-bars-chart-panel
            v-if="!compareDataIsLoading"
            class="pl-4 pr-4"
            :facets="divergingBarsFacets"
            :round-value-fn="roundValueForDisplay"
            :scale="scale"
            @load-more-items="handleLoadMoreItemsInCompare"
          />
          <spinner v-if="compareDataIsLoading" class="pl-4 pr-4 d-flex justify-content-center" />
        </div>

        <side-by-side-facets-panel
          v-if="mode === modes.Inspect"
          :facets="sideBySideBarFacets"
          :comparable-loading-flags="loadingFlags"
          :disable-handling-loading-and-empty="true"
          :comparables="comparables"
          @load-more-items="handleLoadMoreItemsInInspect"
          @comparable-updated="handleComparableUpdated"
        />
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import Collection from '@/models/Collection'
import {
  search,
  collections,
  searchQueriesComparison,
  searchFacets,
  filtersItems as filtersItemsService
} from '@/services'
import QueryHeaderPanel from '@/components/modules/searchQueriesComparison/QueryHeaderPanel.vue'
import DivergingBarsChartPanel from '@/components/modules/searchQueriesComparison/DivergingBarsChartPanel.vue'
import SideBySideFacetsPanel from '@/components/modules/searchQueriesComparison/SideBySideFacetsPanel.vue'
import Spinner from '@/components/layout/Spinner.vue'
import Bucket from '@/models/Bucket'
import {
  optimizeFilters,
  deserializeFilters,
  serializeFilters,
  joinFiltersWithItems,
  SupportedFiltersByContext
} from '@/logic/filters'
import { getQueryParameter } from '../router/util'
import { getBucketLabel } from '../logic/facets'
import { ComparableTypes, comparableToQuery } from '@/logic/queryComparison'
import { getLatestFilters } from '../logic/storage'
import { Navigation } from '@/plugins/Navigation'

/**
 * @param {import('@/models').Filter} filter
 * @returns {boolean}
 */
const supportedSearchIndexFilters = filter => SupportedFiltersByContext.search.includes(filter.type)

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').SearchQuery} SearchQuery
 * @typedef {import('@/logic/queryComparison').Comparable} Comparable
 * @typedef {{ left: number, right: number, intersection: number, label: string }} FacetItem
 */

function prepareFacets(responseFacets = {}) {
  const types = Object.keys(responseFacets).filter(k => k !== 'count')
  return types.map(type => {
    const buckets = responseFacets[type].buckets || []
    const numBuckets = responseFacets[type].numBuckets ?? buckets.length
    return {
      id: type,
      buckets: buckets.map(bucket => new Bucket({ ...bucket, type })),
      numBuckets
    }
  })
}

/**
 * @param {Comparable} comparable
 * @returns {boolean}
 */
function comparableIsEmpty(comparable) {
  const type = comparable?.type

  if (type === ComparableTypes.Query) {
    if (comparable.query == null || comparable.query.filters == null) return true
    return false
  }
  if (comparable.type === ComparableTypes.Collection) {
    return comparable.id == null || comparable.id === '' ? true : false
  }

  if (comparable.type === ComparableTypes.Intersection) {
    if (comparable?.filters == null) return true
    return false
  }

  return true
}

/**
 * Merge filters with a rule that all single item (`q`) filters operator
 * is set to `AND`. Then the standard merge is applied.
 * @param {Filter[][]} filtersSets
 * @returns {Filter[]}
 */
function mergeFilters(filtersSets) {
  return optimizeFilters(
    filtersSets.flat().map(filter => {
      const op =
        (Array.isArray(filter.q) && filter.q.length === 1) || !Array.isArray(filter.q)
          ? 'AND'
          : filter.op
      return {
        ...filter,
        op
      }
    })
  )
}

const SortingMethods = Object.freeze({
  /**
   * Sort items by highest cumulative overlap in percents.
   * @param {FacetItem} itemA
   * @param {FacetItem} itemB
   */
  HighestTotalIntersectionInPercents: (itemA, itemB) => {
    const totalPc = item => item.intersection / item.left + item.intersection / item.right
    return totalPc(itemB) - totalPc(itemA)
  },
  /**
   * Sort items by highest absolute value of intersection.
   * @param {FacetItem} itemA
   * @param {FacetItem} itemB
   */
  HighestAbsoluteIntersection: (itemA, itemB) => itemB.intersection - itemA.intersection
})

const CollectionRegex = /c:(.*)/

/**
 * @param {string | undefined} value
 * @returns {Comparable}
 */
function queryParameterToComparable(value) {
  if (typeof value != 'string') return { type: ComparableTypes.Query }
  // previous method /c:(.*)/
  const collectionMatch = value.match(CollectionRegex)
  if (collectionMatch != null) {
    return {
      type: ComparableTypes.Query,
      query: {
        filters: [
          {
            type: 'collection',
            q: collectionMatch[1]
          }
        ]
      }
    }
  }
  // return { type: ComparableTypes.Collection, id: collectionMatch[1] }

  return {
    type: ComparableTypes.Query,
    query: { filters: deserializeFilters(value).filter(supportedSearchIndexFilters) }
  }
}

/**
 * @param {Comparable} comparable
 * @returns {string | undefined}
 */
function serializeComparable(comparable) {
  const type = comparable?.type

  if (type === ComparableTypes.Collection) {
    const collectionId = comparable.id ?? ''
    return `c:${collectionId}`
  }
  if (type === ComparableTypes.Query) {
    if (comparable.query == null || comparable.query.filters == null) {
      return undefined
    }
    return serializeFilters(comparable.query.filters)
  }

  return undefined
}

const CompareFacetItemsLimit = 10

const QueryIndex = Object.freeze({
  Left: 0,
  Intersection: 1,
  Right: 2
})

const Mode = Object.freeze({
  Inspect: 'inspect',
  Compare: 'compare'
})

const QueryParameters = Object.freeze({
  Left: 'left',
  Right: 'right',
  Mode: 'mode',
  BarSortingMethod: 'barSorting',
  Scale: 'scale'
})

const Scales = Object.freeze(['linear', 'sqrt'])

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

export default {
  data: () => ({
    /**
     * Loading flags indicate that comparable at flag's index is loading data
     * from the API.
     * @type {boolean[]}
     */
    loadingFlags: [...Array(3).keys()].map(() => false),
    compareDataIsLoading: false,
    /**
     * [<facet id>, <facet visualisation method>]
     */
    facets: /** @type {[string, string][]} */ ([
      // lightweight
      ['year', 'timeline'],
      ['newspaper', 'bars'],
      ['country', 'bars'],
      ['language', 'bars'],
      ['type', 'bars'],
      // heavyweight
      ['topic', 'bars'],
      ['person', 'bars'],
      ['location', 'bars']
    ]),
    /** @type {any[]} */
    queriesResults: [{}, { type: 'intersection' }, {}],
    /** @type {{ [key:string]: Bucket[] }[]} */
    additionalBuckets: [{}, {}, {}],
    /** @type {any} */
    comparisonResult: undefined,
    /**
     * list of available collections
     * @type {Collection[]}
     */
    collections: [],
    modes: Mode,
    sortingMethods: Object.keys(SortingMethods),
    scales: Scales,
    /** @type {Filter[][]|undefined[]} */
    filtersWithItems: [undefined, undefined, undefined]
  }),
  watch: {
    leftComparable: {
      /**
       * @param {Comparable} newValue
       * @param {Comparable} oldValue
       */
      async handler(newValue, oldValue) {
        if (deepEqual(newValue, oldValue)) return
        try {
          this.loadingFlags[QueryIndex.Left] = true
          const result = await this.getQueryResult(this.leftComparable)
          this.queriesResults[QueryIndex.Left] = result
        } finally {
          this.loadingFlags[QueryIndex.Left] = false
        }

        const filtersWithItems = await filtersItemsService
          .find({
            query: {
              filters: serializeFilters(comparableToQuery(this.leftComparable)?.filters ?? [])
            }
          })
          .then(joinFiltersWithItems)
        this.filtersWithItems[QueryIndex.Left] = filtersWithItems
      },
      deep: true,
      immediate: true
    },
    rightComparable: {
      /**
       * @param {Comparable} newValue
       * @param {Comparable} oldValue
       */
      async handler(newValue, oldValue) {
        if (deepEqual(newValue, oldValue)) return
        try {
          this.loadingFlags[QueryIndex.Right] = true
          const result = await this.getQueryResult(this.rightComparable)
          this.queriesResults[QueryIndex.Right] = result
        } finally {
          this.loadingFlags[QueryIndex.Right] = false
        }

        const filtersWithItems = await filtersItemsService
          .find({
            query: {
              filters: serializeFilters(comparableToQuery(this.rightComparable)?.filters ?? [])
            }
          })
          .then(joinFiltersWithItems)
        this.filtersWithItems[QueryIndex.Right] = filtersWithItems
      },
      deep: true,
      immediate: true
    },
    intersection: {
      /**
       * @param {Comparable} newValue
       * @param {Comparable} oldValue
       */
      async handler(newValue, oldValue) {
        if (deepEqual(newValue, oldValue)) return

        this.updateCompareData()

        try {
          this.loadingFlags[QueryIndex.Intersection] = true
          const result = await this.getQueryResult(this.intersection)
          this.queriesResults[QueryIndex.Intersection] = result
        } finally {
          this.loadingFlags[QueryIndex.Intersection] = false
        }
      },
      deep: true,
      immediate: true
    }
  },
  async mounted() {
    // @todo: remove collections prefecth
    // get collections on created.
    const { data } = await collections.find().catch(err => {
      if (err.name === 'NotAuthenticated') return { data: [] }
      throw err
    })
    this.collections = data.map(d => new Collection(d))
  },
  computed: {
    $navigation() {
      return new Navigation(this)
    },
    leftComparable: {
      /** @returns {Comparable} */
      get() {
        return queryParameterToComparable(getQueryParameter(this, QueryParameters.Left))
      },
      /** @param {Comparable} comparable */
      set(comparable) {
        const serializedComparable = serializeComparable(comparable)
        this.$navigation.updateQueryParametersWithHistory({
          [QueryParameters.Left]: serializedComparable
        })
      }
    },
    /** @returns {Comparable} */
    leftComparableEnriched() {
      // add additional filters if any to the original left comparable query
      // e.g. this.leftComparable must be can be smthing like { type: "query", query: {filters:[]} }:
      // Before, it was { type: "collection", id: "local-xzy" } but we integrated
      // colleciton in query filters.
      if (
        this.leftComparable?.query?.filters != null &&
        this.filtersWithItems[QueryIndex.Left] != null
      ) {
        return {
          type: this.leftComparable.type,
          query: /** @type {SearchQuery} */ ({
            ...this.leftComparable.query,
            filters: this.filtersWithItems[QueryIndex.Left]
          })
        }
      }
      return this.leftComparable
    },
    rightComparable: {
      /** @returns {Comparable} */
      get() {
        return queryParameterToComparable(getQueryParameter(this, QueryParameters.Right))
      },
      /** @param {Comparable} comparable */
      set(comparable) {
        const serializedComparable = serializeComparable(comparable)
        this.$navigation.updateQueryParametersWithHistory({
          [QueryParameters.Right]: serializedComparable
        })
      }
    },
    /** @returns {Comparable} */
    rightComparableEnriched() {
      if (
        this.rightComparable?.query?.filters != null &&
        this.filtersWithItems[QueryIndex.Right] != null
      ) {
        return {
          type: this.rightComparable.type,
          query: /** @type {SearchQuery} */ ({
            ...this.rightComparable.query,
            filters: this.filtersWithItems[QueryIndex.Right]
          })
        }
      }
      return this.rightComparable
    },
    /** @returns {Comparable} */
    intersection() {
      const comparablesFilters = [this.leftComparable, this.rightComparable]
        .filter(comparable => !comparableIsEmpty(comparable))
        .map(comparableToQuery)
        .filter(query => query != null)
        .map(query => query?.filters ?? [])

      if (comparablesFilters.length !== 2) {
        return {
          type: 'intersection',
          filters: undefined
        }
      }

      return {
        type: 'intersection',
        filters: mergeFilters(comparablesFilters)
      }
    },
    /** @returns {Comparable[]} */
    comparables() {
      return [this.leftComparable, this.intersection, this.rightComparable]
    },
    /**
     * @typedef {{ id: string, items: FacetItem[], numBuckets: number }} FacetContainer
     * @returns {FacetContainer[]}
     */
    divergingBarsFacets() {
      if (this.comparisonResult == null) return []

      const { intersectionFacets, facetsIds, facetsSets } = this.comparisonResult

      return facetsIds.map((id, index) => {
        const intersectionFacet = intersectionFacets[index]
        const queriesFacets = facetsSets.map(facetSet => facetSet[index])

        const items =
          intersectionFacet?.buckets
            ?.map(bucket => {
              const [leftBucket, rightBucket] = queriesFacets.map(({ buckets }) => {
                return buckets.find(({ val }) => bucket.val === val)
              })

              const label =
                leftBucket != null
                  ? getBucketLabel(leftBucket, id, this)
                  : getBucketLabel(rightBucket, id, this)

              return {
                intersection: bucket.count,
                label,
                left: leftBucket.count,
                right: rightBucket.count
              }
            })
            .sort(SortingMethods[this.barSortingMethod]) ?? []

        return {
          id,
          items,
          numBuckets: intersectionFacet?.numBuckets ?? 0
        }
      })
    },
    /**
     * @typedef {import('../models').Bucket} BucketItem
     * @typedef {{ buckets: BucketItem[], isLoaded: boolean, numBuckets: number }} ComparableItem
     * @typedef {{ id: string, comparableItems: ComparableItem[], visualisationType: string }} SideBySideFacetContainer
     * @returns {SideBySideFacetContainer[]}
     */
    sideBySideFacets() {
      return this.facets.map(([facetId, visualisationType]) => {
        return {
          id: facetId,
          visualisationType,
          comparableItems: this.queriesResults.map((result, comparableIndex) => {
            const item = (result?.facets ?? []).find(({ id }) => id === facetId)
            const buckets = item?.buckets ?? []
            const additionalBuckets = this.additionalBuckets[comparableIndex][facetId] ?? []

            return {
              isLoaded: result.facets != null,
              buckets: buckets.concat(additionalBuckets),
              numBuckets: item?.numBuckets ?? item?.buckets?.length ?? 0
            }
          })
        }
      })
    },
    /**
     * @returns {SideBySideFacetContainer[]}
     */
    sideBySideTimelineFacets() {
      return this.sideBySideFacets.filter(
        ({ visualisationType }) => visualisationType === 'timeline'
      )
    },
    /**
     * @returns {SideBySideFacetContainer[]}
     */
    sideBySideBarFacets() {
      return this.sideBySideFacets.filter(({ visualisationType }) => visualisationType === 'bars')
    },
    mode: {
      /** @returns {string} */
      get() {
        const value = getQueryParameter(this, QueryParameters.Mode) ?? Mode.Inspect
        return value === Mode.Inspect ? Mode.Inspect : Mode.Compare
      },
      /** @param {string} value */
      set(value) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.Mode]: value
        })
      }
    },
    barSortingMethod: {
      /** @returns {string} */
      get() {
        const value =
          getQueryParameter(this, QueryParameters.BarSortingMethod) ?? 'HighestAbsoluteIntersection'
        return this.sortingMethods.includes(value) ? value : 'HighestAbsoluteIntersection'
      },
      /** @param {string} value */
      set(value) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.BarSortingMethod]: value
        })
      }
    },
    scale: {
      /** @returns {string} */
      get() {
        const value = getQueryParameter(this, QueryParameters.Scale) ?? 'linear'
        return this.scales.includes(value) ? value : 'linear'
      },
      /** @param {string} value */
      set(value) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.Scale]: value
        })
      }
    }
  },
  components: {
    SideBySideFacetsPanel,
    QueryHeaderPanel,
    DivergingBarsChartPanel,
    Spinner
  },
  methods: {
    /**
     * @param {Comparable} comparable
     * @returns {Promise<any>}
     */
    async getQueryResult(comparable) {
      if (comparableIsEmpty(comparable)) return {}

      const query = {
        ...comparableToQuery(comparable),
        limit: 0,
        facets: this.facets.map(([facetType]) => facetType),
        group_by: 'articles'
      }

      const { type, id } = comparable

      const resultPromise = search.find({ query }).then(result => ({
        id,
        type,
        title: '',
        facets: prepareFacets(result.info.facets),
        total: result.total
      }))
      const collectionTitlePromise =
        type === ComparableTypes.Collection
          ? collections
              .get(id, { query: { nameOnly: true } })
              .then(({ name }) => name)
              .catch(e => {
                if (e.name === 'NotFound') return this.$t('cta.select-collection')
                throw e
              })
          : Promise.resolve('')

      const [result, collectionTitle] = await Promise.all([resultPromise, collectionTitlePromise])

      if (type === ComparableTypes.Collection) result.title = collectionTitle

      return result
    },
    /**
     * @param {Comparable} comparable
     * @param {number} comparableIndex
     * @param {string} facetId
     * @returns {Promise<Bucket[]>}
     */
    async getAdditionalFacets(comparable, comparableIndex, facetId) {
      if (comparableIsEmpty(comparable)) return []

      const offset =
        this.sideBySideFacets.find(({ id }) => id === facetId)?.comparableItems[comparableIndex]
          ?.buckets?.length ?? 0

      const query = {
        filters: comparable?.query?.filters ?? comparable?.filters,
        limit: 10,
        offset
      }

      try {
        this.loadingFlags[comparableIndex] = true
        const result = await searchFacets.get(facetId, { query })
        const buckets = result != null ? result.buckets : []
        return buckets.map(bucket => new Bucket({ ...bucket, type: facetId }))
      } finally {
        this.loadingFlags[comparableIndex] = false
      }
    },
    /**
     * @param {{ comparableIndex: number, facetId: string }} param
     */
    async handleLoadMoreItemsInInspect({ comparableIndex, facetId }) {
      const comparable = this.comparableForQuery(comparableIndex)
      const buckets = await this.getAdditionalFacets(comparable, comparableIndex, facetId)

      const additionaBucketsForComparable = this.additionalBuckets[comparableIndex]
      const allBuckets = additionaBucketsForComparable[facetId] ?? []
      additionaBucketsForComparable[facetId] = allBuckets.concat(buckets)

      this.additionalBuckets[comparableIndex] = additionaBucketsForComparable
    },
    /** @param {string | undefined} loadMoreType */
    async updateCompareData(loadMoreType = undefined) {
      if (comparableIsEmpty(this.leftComparable) || comparableIsEmpty(this.rightComparable)) return

      const getLoadedNumberOfItems = type => {
        const facet = this.comparisonResult?.intersectionFacets?.find(({ type: t }) => type === t)
        if (facet == null) return 0

        return facet.buckets.length
      }

      const query = {
        filtersSets: [this.leftComparable, this.rightComparable].map(
          comparable => comparableToQuery(comparable)?.filters ?? []
        ),
        facets: this.facets
          .filter(([type]) => type !== 'year')
          .map(([type]) => {
            return {
              type,
              limit:
                loadMoreType === type
                  ? getLoadedNumberOfItems(type) + CompareFacetItemsLimit
                  : CompareFacetItemsLimit
            }
          })
      }

      try {
        this.compareDataIsLoading = true
        this.comparisonResult = await searchQueriesComparison.create(query)
      } finally {
        this.compareDataIsLoading = false
      }
    },
    /**
     * @param {FacetContainer} facetContainer
     */
    async handleLoadMoreItemsInCompare(facetContainer) {
      await this.updateCompareData(facetContainer.id)
    },
    /**
     * @param {number} queryIdx
     * @param {Comparable} comparable
     */
    onComparableUpdated(queryIdx, comparable) {
      if (queryIdx === QueryIndex.Left) this.leftComparable = comparable
      else if (queryIdx === QueryIndex.Right) this.rightComparable = comparable
      else throw new Error(`Trying to update unexpected comparable index: ${queryIdx}`)
    },
    /**
     * @param {string} mode
     */
    onModeUpdated(mode) {
      this.mode = mode
    },
    /**
     * @param {number} queryIndex
     * @returns {Comparable}
     */
    comparableForQuery(queryIndex) {
      if (queryIndex === QueryIndex.Left) return this.leftComparableEnriched
      if (queryIndex === QueryIndex.Right) return this.rightComparableEnriched
      if (queryIndex === QueryIndex.Intersection) return this.intersection

      throw new Error(`Trying to get unexpected comparable index: ${queryIndex}`)
    },
    /**
     * @param {number} queryIdx
     */
    handleInsertRecentSearchQuery(queryIdx) {
      const filtersLeft = serializeFilters(this.leftComparable.query?.filters ?? [])
      const filtersRight = serializeFilters(this.rightComparable.query?.filters ?? [])

      const filters = getLatestFilters().filter(supportedSearchIndexFilters)
      const recentQuery = serializeFilters(filters)
      const query = { ...this.$router.currentRoute.query }
      if (queryIdx === 0) {
        query.left = recentQuery
        query.right = filtersRight
      }
      if (queryIdx === 2) {
        query.left = filtersLeft
        query.right = recentQuery
      }
      if (JSON.stringify(this.$route.query) !== JSON.stringify(query)) {
        this.$router.push({
          name: 'compare',
          query: query
        })
      }
    },
    /** @param {number} value */
    roundValueForDisplay(value) {
      try {
        return this.$n(value ?? 0, { notation: 'short' })
      } catch (e) {
        if (e instanceof RangeError) {
          return this.$n(value ?? 0)
        }
      }
    },
    /**
     * @param {{ comparableIndex: number, comparable: Comparable }} param
     */
    handleComparableUpdated({ comparableIndex, comparable }) {
      if (comparableIndex === QueryIndex.Left) this.leftComparable = comparable
      if (comparableIndex === QueryIndex.Right) this.rightComparable = comparable
    }
  }
}
</script>

<style lang="scss" scoped>
.pm-fixer {
  margin: 0;
  &:last-child {
    height: 100%;
  }
  flex-wrap: nowrap !important;
  width: 100%;
}
.aspects-container {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  overflow-x: hidden;
  max-width: 100%;
  height: 100%;
  margin-top: 1px;
  padding-left: 0;
  padding-right: 0;
}
.one-third {
  flex: 1 1 auto !important;
  max-width: 33.33%;
  max-width: calc(100% / 3);
}
.pc30 {
  flex-grow: 1;
  flex-basis: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "cta": {
      "select-collection": "Please select a collection"
    },
    "mode": {
      "inspect": "Inspect",
      "compare": "Compare"
    },
    "sortBy": "Sort by",
    "sortingMethods": {
      "HighestTotalIntersectionInPercents": "Total intersection span in %",
      "HighestAbsoluteIntersection": "Absolute intersection"
    },
    "scale": "Scale",
    "scales": {
      "linear": "Linear",
      "sqrt": "Square root"
    }
  }
}
</i18n>
