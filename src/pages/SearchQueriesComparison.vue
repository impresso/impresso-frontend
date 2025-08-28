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
              :total="queryResult?.total"
              :title="queryResult?.title"
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

<script lang="ts">
import Collection from '@/models/Collection'
import {
  collections,
  searchQueriesComparison,
  searchFacets,
  contentItems as contentItemsService,
  filtersItems as filtersItemsService
} from '@/services'
import QueryHeaderPanel from '@/components/modules/searchQueriesComparison/QueryHeaderPanel.vue'
import DivergingBarsChartPanel, {
  FacetItem
} from '@/components/modules/searchQueriesComparison/DivergingBarsChartPanel.vue'
import SideBySideFacetsPanel, {
  ComparableItem,
  FacetContainer
} from '@/components/modules/searchQueriesComparison/SideBySideFacetsPanel.vue'
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
import { ComparableTypes, comparableToQuery, Comparable } from '../logic/queryComparison'
import { getLatestFilters } from '../logic/storage'
import { Navigation } from '@/plugins/Navigation'
import { Filter } from '@/models'
import { SearchFacet, SearchFacetBucket, SearchFacetRangeBucket } from '@/models/generated/schemas'
import { isBucket, isTermOrRangeBucket } from '@/models/typeGuards'
import { FacetType } from '@/models/Facet'

type IBucket = SearchFacetBucket | SearchFacetRangeBucket

export interface QueryResult {
  id: string
  type: string
  title: string
  facets: SearchFacet[]
  total: number
}

const supportedSearchIndexFilters = (filter: Filter) =>
  SupportedFiltersByContext.search.includes(filter.type)

function comparableIsEmpty(comparable: Comparable) {
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
 */
function mergeFilters(filtersSets: Filter[][]): Filter[] {
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
   */
  HighestTotalIntersectionInPercents: (itemA: FacetItem, itemB: FacetItem) => {
    const totalPc = (item: FacetItem) =>
      item.intersection / item.left + item.intersection / item.right
    return totalPc(itemB) - totalPc(itemA)
  },
  /**
   * Sort items by highest absolute value of intersection.
   */
  HighestAbsoluteIntersection: (itemA: FacetItem, itemB: FacetItem) =>
    itemB.intersection - itemA.intersection
})

const CollectionRegex = /c:(.*)/

function queryParameterToComparable(value: string | undefined): Comparable {
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

function serializeComparable(comparable: Comparable): string | undefined {
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

export interface IData {
  /**
   * Loading flags indicate that comparable at flag's index is loading data
   * from the API.
   */
  loadingFlags: boolean[]
  compareDataIsLoading: boolean
  /**
   * [<facet id>, <facet visualisation method>]
   */
  facets: [FacetContainer['id'], FacetContainer['visualisationType']][]
  queriesResults: [QueryResult | undefined, QueryResult | undefined, QueryResult | undefined]
  maxValues: Record<Extract<FacetContainer['id'], 'year'>, IBucket[]>
  additionalBuckets: { [key: string]: IBucket[] }[]
  comparisonResult?: any
  /**
   * list of available collections
   */
  collections: Collection[]
  modes: typeof Mode
  sortingMethods: string[]
  scales: readonly string[]
  filtersWithItems: (Filter[] | undefined)[]
}

export default {
  data: (): IData => {
    return {
      loadingFlags: [...Array(3).keys()].map(() => false),
      compareDataIsLoading: false,
      facets: [
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
      ],
      queriesResults: [undefined, undefined /*{ type: 'intersection' }*/, undefined],
      maxValues: { year: [] },
      additionalBuckets: [{}, {}, {}],
      comparisonResult: undefined,
      collections: [],
      modes: Mode,
      sortingMethods: Object.keys(SortingMethods),
      scales: Scales,
      filtersWithItems: [undefined, undefined, undefined]
    } satisfies IData
  },
  watch: {
    leftComparable: {
      async handler(newValue: Comparable, oldValue: Comparable) {
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
      async handler(newValue: Comparable, oldValue: Comparable) {
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
      async handler(newValue: Comparable, oldValue: Comparable) {
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
    this.maxValues.year = await this.getMaxValues('year', 100000)

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
      get(): Comparable {
        return queryParameterToComparable(getQueryParameter(this, QueryParameters.Left))
      },
      set(comparable: Comparable) {
        const serializedComparable = serializeComparable(comparable)
        this.$navigation.updateQueryParametersWithHistory({
          [QueryParameters.Left]: serializedComparable
        })
      }
    },
    leftComparableEnriched(): Comparable {
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
          query: /** @type {SearchQuery} */ {
            ...this.leftComparable.query,
            filters: this.filtersWithItems[QueryIndex.Left]
          }
        }
      }
      return this.leftComparable
    },
    rightComparable: {
      get(): Comparable {
        return queryParameterToComparable(getQueryParameter(this, QueryParameters.Right))
      },
      set(comparable: Comparable) {
        const serializedComparable = serializeComparable(comparable)
        this.$navigation.updateQueryParametersWithHistory({
          [QueryParameters.Right]: serializedComparable
        })
      }
    },
    rightComparableEnriched(): Comparable {
      if (
        this.rightComparable?.query?.filters != null &&
        this.filtersWithItems[QueryIndex.Right] != null
      ) {
        return {
          type: this.rightComparable.type,
          query: {
            ...this.rightComparable.query,
            filters: this.filtersWithItems[QueryIndex.Right]
          }
        }
      }
      return this.rightComparable
    },
    intersection(): Comparable {
      const bothComparables: Comparable[] = [this.leftComparable, this.rightComparable]
      const comparablesFilters = bothComparables
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
                left: leftBucket?.count,
                right: rightBucket?.count
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
    sideBySideFacets(): FacetContainer[] {
      return this.facets.map(([facetId, visualisationType]) => {
        const comparableItems: ComparableItem[] = this.queriesResults.map(
          (result, comparableIndex) => {
            const item = (result?.facets ?? []).find(({ type }) => type === facetId)
            const itemBuckets: IBucket[] = item?.buckets ?? []
            const additionalBuckets = this.additionalBuckets[comparableIndex][facetId] ?? []

            const buckets = itemBuckets.concat(additionalBuckets).filter(isBucket) as Bucket[]

            return {
              isLoaded: result?.facets != null,
              buckets,
              numBuckets: item?.numBuckets ?? item?.buckets?.length ?? 0,
              maxValues: this.maxValues[facetId] ?? []
            } satisfies ComparableItem
          }
        )

        return {
          id: facetId,
          visualisationType,
          comparableItems
        } satisfies FacetContainer
      })
    },
    sideBySideTimelineFacets(): FacetContainer[] {
      return this.sideBySideFacets.filter(
        ({ visualisationType }) => visualisationType === 'timeline'
      )
    },
    sideBySideBarFacets(): FacetContainer[] {
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
    async getMaxValues(facetId: FacetType, limit?: number) {
      const result = await searchFacets.get(facetId, {
        query: { limit }
      })
      return result?.buckets ?? []
    },
    async getQueryResult(comparable: Comparable): Promise<QueryResult | undefined> {
      if (comparableIsEmpty(comparable)) return

      const query = {
        ...comparableToQuery(comparable),
        limit: 25,
        facets: this.facets.map(([facetType]) => facetType)
        // group_by: 'articles'
      }

      const { type, id } = comparable

      const resultPromise = searchFacets.find({ query }).then(result => ({
        id,
        type,
        title: '',
        facets: result.data,
        total: result.total
      }))
      const totalPromise = contentItemsService
        .find({
          query: {
            ...comparableToQuery(comparable),
            limit: 0
          }
        })
        .then(result => result.total)

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

      const [result, collectionTitle, total] = await Promise.all([
        resultPromise,
        collectionTitlePromise,
        totalPromise
      ])

      if (type === ComparableTypes.Collection) result.title = collectionTitle

      return { ...result, total } satisfies QueryResult
    },
    async getAdditionalFacets(
      comparable: Comparable,
      comparableIndex: number,
      facetId: string
    ): Promise<IBucket[]> {
      if (comparableIsEmpty(comparable)) return []

      const offset: number =
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
        return buckets.map(bucket => new Bucket({ ...bucket, type: facetId })) as IBucket[]
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
    handleInsertRecentSearchQuery(queryIdx: number) {
      const filtersLeft = serializeFilters(this.leftComparable.query?.filters ?? [])
      const filtersRight = serializeFilters(this.rightComparable.query?.filters ?? [])

      const filters = getLatestFilters().filter(supportedSearchIndexFilters)
      const recentQuery = serializeFilters(filters)
      const query = {
        ...((this.$router.currentRoute as any).query as object)
      } as { left?: string; right?: string; mode?: string }
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
