<template lang="html">
  <i-layout id="SearchQueriesComparisonPage">
    <i-layout-section class="border-top ">
      <div slot="header">
        <div class="header row pm-fixer bg-light">
          <div class="one-third"
              v-for="(queryResult, queryIdx) in queriesResults"
              :key="queryIdx">
            <query-header-panel :left='queryIdx === 0'
                                :comparison-options="['intersection']"
                                :mode-options="['inspect', 'compare']"
                                :mode="mode"
                                :comparable="comparableForQuery(queryIdx)"
                                :total="queryResult.total"
                                :title="queryResult.title"
                                :collections="collections"
                                @mode-changed="onModeUpdated"
                                @comparable-changed="comparable => onComparableUpdated(queryIdx, comparable)"/>
          </div>
        </div>
      </div>
      <!-- body -->
      <div class="aspects-container container-fluid">
        <side-by-side-facets-panel :facets="sideBySideTimelineFacets"
                                   :comparable-loading-flags="loadingFlags"
                                   @insertRecentSearchQuery="handleInsertRecentSearchQuery"/>

        <div class="d-flex justify-content-between pl-4 pr-4">
          <div class="pc30"></div>
          <div class="pc30 d-flex justify-content-md-center">
            <b-form-radio-group v-model="mode" button-variant="outline-primary" size="sm" buttons>
              <b-form-radio :value="modes.Compare">{{$t("mode.compare")}}</b-form-radio>
              <b-form-radio :value="modes.Inspect">{{$t("mode.inspect")}}</b-form-radio>
            </b-form-radio-group>
          </div>
          <div class="pc30 d-flex justify-content-md-end">
            <!-- scale -->
            <b-dropdown size="sm" variant="outline-secondary" class="pr-1" v-if="mode === modes.Compare">
              <template v-slot:button-content>
                <span>{{$t('scale')}}: {{$t(`scales.${scale}`)}}</span>
              </template>
              <b-dropdown-item v-for="s in scales"
                               :key="s"
                               :active="s === scale"
                               @click="scale = s">
                {{$t(`scales.${s}`)}}
              </b-dropdown-item>
            </b-dropdown>

            <!-- sorting method -->
            <b-dropdown size="sm" variant="outline-secondary" v-if="mode === modes.Compare">
              <template v-slot:button-content>
                <span>{{$t('sortBy')}} {{$t(`sortingMethods.${barSortingMethod}`)}}</span>
              </template>
              <b-dropdown-item v-for="sortingMethod in sortingMethods"
                               :key="sortingMethod"
                               :active="sortingMethod === barSortingMethod"
                               @click="barSortingMethod = sortingMethod">
                {{$t(`sortingMethods.${sortingMethod}`)}}
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>

        <diverging-bars-chart-panel v-if="mode === modes.Compare"
                                    class="pl-4 pr-4"
                                    :facets="divergingBarsFacets"
                                    :round-value-fn="roundValueForDisplay"
                                    :scale="scale"/>

        <side-by-side-facets-panel v-if="mode === modes.Inspect"
                                   :facets="sideBySideBarFacets"
                                   :comparable-loading-flags="loadingFlags"
                                   :disable-handling-loading-and-empty="true"/>

      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
// import { protobuf } from 'impresso-jscommons';
import Collection from '@/models/Collection';
import { search, collections } from '@/services';
import QueryHeaderPanel from '@/components/modules/searchQueriesComparison/QueryHeaderPanel';
import DivergingBarsChartPanel from '@/components/modules/searchQueriesComparison/DivergingBarsChartPanel'
import SideBySideFacetsPanel from '@/components/modules/searchQueriesComparison/SideBySideFacetsPanel'
import Bucket from '@/models/Bucket';
import { optimizeFilters, deserializeFilters, serializeFilters } from '@/logic/filters'
import { getQueryParameter } from '../router/util';
import { getBucketLabel } from '../logic/facets';
import { ComparableTypes, comparableToQuery } from '@/logic/queryComparison'

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').SearchQuery} SearchQuery
 * @typedef {import('@/logic/queryComparison').Comparable} Comparable
 * @typedef {{ left: number, right: number, intersection: number, label: string }} FacetItem
 */

function prepareFacets(responseFacets = {}) {
  const types = Object.keys(responseFacets).filter(k => k !== 'count');
  return types.map((type) => {
    const buckets = responseFacets[type].buckets || [];
    return {
      id: type,
      buckets: buckets.map(bucket => new Bucket({ ...bucket, type })),
    };
  });
}

/**
 * @param {Comparable} comparable
 * @returns {boolean}
 */
function comparableIsEmpty(comparable) {
  const type = comparable?.type

  if (type === ComparableTypes.Query) {
    if (comparable.query == null || comparable.query.filters == null) return true;
    return false
  }
  if (comparable.type === ComparableTypes.Collection) {
    return comparable.id == null || comparable.id === ''
      ? true
      : false
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
  return optimizeFilters(filtersSets.flat().map(filter => {
    const op = (Array.isArray(filter.q) && filter.q.length === 1) || !Array.isArray(filter.q)
      ? 'AND'
      : filter.op
    return {
      ...filter,
      op
    }
  }))
}

/**
 * @param {any[]} queriesResults
 * @param {string} facetId
 * @param {import('vue/types/vue').Vue} vueInstance
 * @returns {FacetItem[]}
 */
function getItemsForFacet(queriesResults, facetId, vueInstance) {
  const [leftBuckets, intersectionBuckets, rightBuckets] = queriesResults.map(results => {
    const facet = results?.facets?.find(({ id }) => id === facetId)
    return facet?.buckets ?? []
  })

  const uniqueIds = [...new Set(leftBuckets.concat(rightBuckets).concat(intersectionBuckets)
    .map(({ val }) => val))]

  return uniqueIds.map(id => {
    const leftBucket = leftBuckets.find(({ val }) => val === id)
    const rightBucket = rightBuckets.find(({ val }) => val === id)
    const intersectionBucket = intersectionBuckets.find(({ val }) => val === id)

    return {
      label: [leftBucket, rightBucket, intersectionBucket].filter(b => b != null).map(bucket => getBucketLabel(bucket, facetId, vueInstance))[0],
      left: /** @type {number} */ (leftBucket ? leftBucket.count : 0),
      right: /** @type {number} */ (rightBucket ? rightBucket.count : 0),
      intersection: /** @type {number} */ (intersectionBucket ? intersectionBucket.count : 0)
    }
  }).filter(({ left, right }) => left > 0 && right > 0)
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

  const collectionMatch = value.match(CollectionRegex)
  if (collectionMatch != null) return { type: ComparableTypes.Collection, id: collectionMatch[1] }

  return {
    type: ComparableTypes.Query,
    query: { filters: deserializeFilters(value) }
  }
}

/**
 * @param {Comparable} comparable
 * @returns {string | undefined}
 */
function serializeComparable(comparable) {
  const type = comparable?.type

  if (type === ComparableTypes.Collection) {
    const collectionId = comparable.id ?? '';
    return `c:${collectionId}`;
  }
  if (type === ComparableTypes.Query) {
    if (comparable.query == null
      || comparable.query.filters == null) {
      return undefined
    }
    return serializeFilters(comparable.query.filters)
  }

  return undefined
}

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
      ['location', 'bars'],
    ]),
    /** @type {any[]} */
    queriesResults: [
      { },
      { type: 'intersection' },
      { },
    ],
    /**
     * list of available collections
     * @type {Collection[]}
     */
    collections: [],
    modes: Mode,
    sortingMethods: Object.keys(SortingMethods),
    scales: Scales
  }),
  watch: {
    leftComparable: {
      async handler(newValue, oldValue) {
        if (deepEqual(newValue, oldValue)) return
        try {
          this.loadingFlags[QueryIndex.Left] = true
          const result = await this.getQueryResult(this.leftComparable)
          this.$set(this.queriesResults, QueryIndex.Left, result)
        } finally {
          this.loadingFlags[QueryIndex.Left] = false
        }
      },
      deep: true,
      immediate: true
    },
    rightComparable: {
      async handler(newValue, oldValue) {
        if (deepEqual(newValue, oldValue)) return
        try {
          this.loadingFlags[QueryIndex.Right] = true
          const result = await this.getQueryResult(this.rightComparable)
          this.$set(this.queriesResults, QueryIndex.Right, result)
        } finally {
          this.loadingFlags[QueryIndex.Right] = false
        }
      },
      deep: true,
      immediate: true
    },
    intersection: {
      async handler(newValue, oldValue) {
        if (deepEqual(newValue, oldValue)) return
        try {
          this.loadingFlags[QueryIndex.Intersection] = true
          const result = await this.getQueryResult(this.intersection)
          this.$set(this.queriesResults, QueryIndex.Intersection, result)
        } finally {
          this.loadingFlags[QueryIndex.Intersection] = false
        }
      },
      deep: true,
      immediate: true
    }
  },
  async mounted() {
    // get collections on created.
    const { data } = await collections.find();
    this.collections = data.map(d => new Collection(d));
  },
  computed: {
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
    intersection() {
      const comparablesFilters = [this.leftComparable, this.rightComparable]
        .filter(comparable => !comparableIsEmpty(comparable))
        .map(comparableToQuery)
        .filter(query => query != null)
        .map(query => query?.filters ?? [])

      if (comparablesFilters.length !== 2) {
        return {
          type: 'intersection',
          filters: undefined,
        };
      }

      return {
        type: 'intersection',
        filters: mergeFilters(comparablesFilters)
      }
    },
    /**
     * @typedef {{ id: string, items: FacetItem[] }} FacetContainer
     * @returns {FacetContainer[]}
     */
    divergingBarsFacets() {
      const compatableFacetTypes = this.facets
        .filter(([, visType]) => visType === 'bars')
        .map(([facetType]) => facetType)
      return compatableFacetTypes.map(type => {
        return {
          id: type,
          items: getItemsForFacet(this.queriesResults, type, this)
            .sort(SortingMethods[this.barSortingMethod])
        }
      })
    },
    /**
     * @typedef {import('../models').Bucket} BucketItem
     * @typedef {{ buckets: BucketItem[], isLoaded: boolean }} ComparableItem
     * @typedef {{ id: string, comparableItems: ComparableItem[], visualisationType: string }} SideBySideFacetContainer
     * @returns {SideBySideFacetContainer[]}
     */
    sideBySideFacets() {
      return this.facets.map(([facetId, visualisationType]) => {
        return {
          id: facetId,
          visualisationType,
          comparableItems: this.queriesResults.map(result => {
            const item = (result?.facets ?? []).find(({ id }) => id === facetId)
            return {
              isLoaded: result.facets != null,
              buckets: item?.buckets ?? []
            }
          })
        }
      })
    },
    /**
     * @returns {SideBySideFacetContainer[]}
     */
    sideBySideTimelineFacets() {
      return this.sideBySideFacets.filter(({ visualisationType }) => visualisationType === 'timeline')
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
        const value = getQueryParameter(this, QueryParameters.Mode) ?? Mode.Compare
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
        const value = getQueryParameter(this, QueryParameters.BarSortingMethod) ?? 'HighestAbsoluteIntersection'
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
    DivergingBarsChartPanel
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

      const resultPromise = search
        .find({ query })
        .then(result => ({
          id,
          type,
          title: '',
          facets: prepareFacets(result.info.facets),
          total: result.total
        }))
      const collectionTitlePromise = type === ComparableTypes.Collection
        ? collections.get(id, { query: { nameOnly: true } })
          .then(({ name }) => name)
          .catch(e => {
            if (e.name === 'NotFound') return this.$t('cta.select-collection')
            throw e;
          })
        : Promise.resolve('')

      const [result, collectionTitle] = await Promise.all([resultPromise, collectionTitlePromise])

      if (type === ComparableTypes.Collection) result.title = collectionTitle

      return result
    },
    /**
     * @param {number} queryIdx
     * @param {Comparable} comparable
     */
    onComparableUpdated(queryIdx, comparable) {
      if (queryIdx === QueryIndex.Left) this.leftComparable = comparable
      else if (queryIdx === QueryIndex.Right) this.rightComparable = comparable
      else throw new Error(`Trying to update unexpected comparable index: ${queryIdx}`);
    },
    onModeUpdated(mode) {
      this.mode = mode;
    },
    /**
     * @param {number} queryIndex
     * @returns {Comparable}
     */
    comparableForQuery(queryIndex) {
      if (queryIndex === QueryIndex.Left) return this.leftComparable
      if (queryIndex === QueryIndex.Right) return this.rightComparable
      if (queryIndex === QueryIndex.Intersection) return this.intersection

      throw new Error(`Trying to get unexpected comparable index: ${queryIndex}`);
    },
    /**
     * @param {number} queryIdx
     */
    handleInsertRecentSearchQuery(queryIdx) {
      const recentSearchHash = this.$store.state.search.currentSearchHash;
      const query = { ...this.$router.currentRoute.query };
      if (queryIdx === 0) query.left = recentSearchHash;
      if (queryIdx === 2) query.right = recentSearchHash;
      if (JSON.stringify(this.$route.query) !== JSON.stringify(query)) {
        this.$router.push({
          name: 'compare',
          query: query,
        });
      }
    },
    /** @param {number} value */
    roundValueForDisplay(value) { return this.$n(value, { notation: 'short' }) }
  },
};
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

<i18n>
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
      "HighestTotalIntersectionInPercents": "Total intercection span in %",
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
