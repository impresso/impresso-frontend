<template lang="html">
  <i-layout id="SearchQueriesComparisonPage">
    <i-layout-section class="border-top ">
      <div slot="header">
        <div class="header row pm-fixer bg-light border-bottom border-tertiary">
          <div class="one-third" :class="{
            'border-right mr-1px': !isLastResult(queryIdx),
            'border-left': queryIdx > 0,
          }"
               v-for="(queryResult, queryIdx) in queriesResults" :key="queryIdx">
            <query-header-panel :left='queryIdx === 0'
                                :comparison-options="['intersection']"
                                :comparable="comparableForQuery(queryIdx)"
                                :total="queryResult.total"
                                :title="queryResult.title"
                                :collections="collections"
                                :comparable-id="`p-${queryIdx}`"
                                @comparable-changed="comparable => onComparableUpdated(queryIdx, comparable)"
                                :colors="colors"/>
          </div>
        </div>
      </div>
      <!-- body -->
      <div class="aspects-container container-fluid">
        <side-by-side-facets-panel :facets="sideBySideTimelineFacets"
                                   :comparable-loading-flags="loadingFlags"
                                   @insertRecentSearchQuery="handleInsertRecentSearchQuery"/>

        <div class="d-flex justify-content-between">
          <div class="pc30"></div>
          <div class="pc30 d-flex justify-content-md-center">
            <b-form-radio-group v-model="mode" button-variant="outline-primary" size="sm" buttons>
              <b-form-radio :value="modes.Compare">{{$t("mode.compare")}}</b-form-radio>
              <b-form-radio :value="modes.Inspect">{{$t("mode.inspect")}}</b-form-radio>
            </b-form-radio-group>
          </div>
          <div class="pc30 d-flex justify-content-md-end">
            <b-dropdown size="sm" variant="outline-secondary" v-if="mode === modes.Compare">
              <template slot="button-content">
                {{$t('sortBy')}} {{$t(`sortingMethods.${barSortingMethod}`)}}
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
                                    :facets="divergingBarsFacets"
                                    :colors="colors"
                                    :round-value-fn="roundValueForDisplay"/>

        <side-by-side-facets-panel v-if="mode === modes.Inspect"
                                   :facets="sideBySideBarFacets"
                                   :comparable-loading-flags="loadingFlags"
                                   :disable-handling-loading-and-empty="true"/>

      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import { protobuf } from 'impresso-jscommons';
import Collection from '@/models/Collection';
import { searchQueriesComparison, search, collections } from '@/services';
import QueryHeaderPanel from './modules/searchQueriesComparison/QueryHeaderPanel';
import DivergingBarsChartPanel from './modules/searchQueriesComparison/DivergingBarsChartPanel'
import SideBySideFacetsPanel from './modules/searchQueriesComparison/SideBySideFacetsPanel'
import Bucket from '../models/Bucket';
import { optimizeFilters } from '@/logic/filters'
import { getQueryParameter } from '../router/util';
import { getBucketLabel } from '../logic/facets';

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

const collectionIdToQuery = id => ({
  filters: [
    {
      type: 'collection',
      q: id,
    },
  ],
});

const comparableToQuery = ({ id, type, query }) => {
  if (type === 'collection') return collectionIdToQuery(id);
  return query;
};

const constructQueryParameters = (comparables, queryParameters) => {
  const [left, right] = comparables
    .map(({ type, query, id }) => {
      if (type === 'collection') return `c:${id || 'unknown-collection-id'}`;
      return query ? protobuf.searchQuery.serialize(query) : undefined;
    });

  return {
    ...queryParameters,
    left,
    right,
  };
};

const deepEqual = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2);

const comparableIsEmpty = (comparable) => {
  if (comparable.type === 'query' ) {
    if (comparable.query === undefined) return true;
    if (comparable.query.filters == null || comparable.query.filters.length === 0) return true;
  }
  if (comparable.type === 'collection' && comparable.id === undefined) return true;
  return false;
};

// const DefaultQuery = { filters: [{ type: 'hasTextContents' }] };

/**
 * @typedef {import('@/models').Filter} Filter
 */

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

const QueryLeftIndex = 0;
const QueriesIntersectionIndex = 1;
const QueryRightIndex = 2;

const Mode = Object.freeze({
  Inspect: 'inspect',
  Compare: 'compare'
})

const QueryParameters = Object.freeze({
  Mode: 'mode',
  BarSortingMethod: 'barSorting'
})

export default {
  data: () => ({
    /** @type {string | undefined} */
    hoverId: '',
    // loading flags indicate that tab at flag's index is loading data
    // from the API.
    /** @type {boolean[]} */
    loadingFlags: [...Array(3).keys()].map(() => false),
    // [<facet id>, <facet visualisation method>]
    /** @type {string[][]} */
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
      ['location', 'bars'],
    ],
    /** @type {any[]} */
    queriesResults: [
      { },
      { type: 'intersection' },
      { },
    ],
    // list of available collections:
    /** @type {any[]} */
    collections: [],
    // comparable items: { type, query, id }
    // where type is one of ['collection', 'query']
    //       id is the ID of the collection if this is a collection
    //       query is a Search Query object.
    /** @type {{ type: string, query?: any }[]} */
    comparables: [
      { type: 'query', query: undefined /* DefaultQuery */ },
      { type: 'query', query: undefined /* DefaultQuery */ },
    ],
    /** @type {{ type: string, query?: any }[]} */
    oldComparables: [], // vue.js does not keep a copy of the old arrays (https://vuejs.org/v2/api/#vm-watch)
    /** @type {{ left: string, right: string }} */
    colors: {
      left: '#2E80C9',
      right: '#FC5C53'
    },
    modes: Mode,
    sortingMethods: Object.keys(SortingMethods)
  }),
  watch: {
    // query parameters updated - this drives state change
    '$route.query': {
      /**
       * @param {any} queryParameters
       */
      handler(queryParameters) {
        const { left = '', right = '' } = queryParameters;
        const comparables = [left, right].map((item, idx) => {
          const parts = item.split(':');
          if (parts.length === 2 && parts[0] === 'c') return { type: 'collection', id: parts[1] };
          try {
            const query = item === ''
              ? undefined /* DefaultQuery */
              : protobuf.searchQuery.deserialize(item);
            return { type: 'query', query };
          } catch (e) {
            throw new Error(`Query ${idx} could not be parsed: ${e.message}`);
          }
        });
        this.comparables = comparables;
      },
      immediate: true,
      deep: true,
    },
    // comparables are updated by the query paramters - fetching new data.
    comparables: {
      /**
       * @param {any[]} value
       */
      handler(value) {
        const [left, right] = value ?? []
        const [oldLeft, oldRight] = this.oldComparables;
        const queries = [];
        if (!deepEqual(left, oldLeft)) {
          queries.push(this.updateQueryResult(QueryLeftIndex, left));
        }

        if (!deepEqual(right, oldRight)) {
          queries.push(this.updateQueryResult(QueryRightIndex, right));
        }

        if (queries.length > 0) {
          queries.push(
            this.updateQueriesIntersectionResult(QueriesIntersectionIndex, [left, right]),
          );
        }
        this.oldComparables = this.comparables.map(c => ({ ...c }));
      },
      immediate: true,
      deep: true,
    },
  },
  async mounted() {
    // get collections on created.
    const { data } = await collections.find();
    this.collections = data.map(d => new Collection(d));
  },
  computed: {
    /**
     * @typedef {{ left: number, right: number, intersection: number, label: string }} FacetItem
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
    }
  },
  components: {
    SideBySideFacetsPanel,
    QueryHeaderPanel,
    DivergingBarsChartPanel
  },
  methods: {
    /**
     * Fetch intersection data
     * @param {number} resultIndex
     * @param {any} comparables
     */
    async updateQueriesIntersectionResult(resultIndex, comparables) {
      const payload = {
        queries: comparables
          .map(comparableToQuery)
          .filter(query => query != null && query.filters.length > 0),
        limit: 0,
        facets: this.facets.map(([type]) => type),
      };

      if (payload.queries.length < 2) {
        this.$set(this.queriesResults, resultIndex, {});
        return;
      }

      this.loadingFlags[resultIndex] = true;
      try {
        const result = await searchQueriesComparison.create(payload, { query: { method: 'intersection' } });
        const resultValue = {
          type: 'intersection',
          title: '',
          facets: prepareFacets(result.info.facets),
          total: result.total,
        };
        this.$set(this.queriesResults, resultIndex, resultValue);
      } finally {
        this.loadingFlags[resultIndex] = false;
      }
    },
    /**
     * Fetch query data
     * @param {number} resultIndex
     * @param {any} comparable
     */
    async updateQueryResult(resultIndex, comparable) {
      if (comparableIsEmpty(comparable)) {
        this.$set(this.queriesResults, resultIndex, {});
        return;
      }

      const payload = {
        ...comparableToQuery(comparable),
        limit: 0,
        facets: this.facets.map(([facetType]) => facetType),
        group_by: 'articles',
      };

      const { type, id } = comparable;

      this.loadingFlags[resultIndex] = true;
      try {
        const result = await search.find({ query: payload });
        const resultValue = {
          id,
          type,
          title: '',
          facets: prepareFacets(result.info.facets),
          total: result.total,
        };
        // update searchQuery
        await this.$store.dispatch('queryComparison/UPDATE_QUERY_COMPONENTS', {
          searchQueryId: `p-${resultIndex}`,
          queryComponents: result.info.queryComponents,
        });
        // https://vuejs.org/v2/guide/list.html#Caveats
        this.$set(this.queriesResults, resultIndex, resultValue);
      } finally {
        this.loadingFlags[resultIndex] = false;
      }

      // if query is for collection - get collection name
      if (type === 'collection') {
        collections.get(id, { query: { nameOnly: true } })
          .then(({ name }) => {
            this.$set(this.queriesResults[resultIndex], 'title', name);
          })
          .catch((e) => {
            if (e.name === 'NotFound') {
              return this.$set(this.queriesResults[resultIndex], 'title', this.$t('cta.select-collection'));
            }
            throw e;
          });
      }
    },
    /**
     * @param {number} idx
     * @returns {boolean}
     */
    isLastResult(idx) {
      return this.queriesResults.length - 1 === idx;
    },
    /**
     * @param {number} queryIdx
     * @param {any} comparable
     */
    onComparableUpdated(queryIdx, comparable) {
      if (queryIdx !== 0 && queryIdx !== 2) return;
      const comparableIdx = queryIdx === 0 ? 0 : 1;

      const comparables = this.comparables.map(c => Object.assign({}, c));
      comparables[comparableIdx] = comparable;

      const queryParameters = constructQueryParameters(comparables, this.$route.query);
      if (JSON.stringify(this.$route.query) !== JSON.stringify(queryParameters)) {
        this.$router.push({
          name: 'compare',
          query: queryParameters,
        });
      }
    },
    /**
     * @param {number} queryIndex
     * @returns {any}
     */
    comparableForQuery(queryIndex) {
      switch (queryIndex) {
      case 0:
        return this.comparables[0];
      case 1:
        // eslint-disable-next-line no-case-declarations
        const comparablesFilters = this.comparables
          .map(comparableToQuery)
          .filter(({ filters } = {}) => filters !== undefined)
          .map(({ filters }) => filters);
        if (comparablesFilters.length !== 2) {
          return {
            type: 'intersection',
            filters: undefined,
          };
        }
        return {
          type: 'intersection',
          filters: mergeFilters(comparablesFilters)
        };
      case 2:
        return this.comparables[1];
      default:
        throw new Error(`Unexpected queryIndex: ${queryIndex}`);
      }
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
    border-top: 1px solid #dee2e6;
    margin-top: 1px;
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
    }
  }
}
</i18n>
