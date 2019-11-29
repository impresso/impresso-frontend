<template lang="html">
  <i-layout id="SearchQueriesComparisonPage">
    <i-layout-section class="border-top mt-1px">
      <div slot="header">
        <div class="header row pm-fixer bg-light border-bottom border-tertiary">
          <div class="one-third" :class="{
            'border-right mr-1px': !isLastResult(queryIdx),
            'border-left': queryIdx > 0,
          }"
               v-for="(queryResult, queryIdx) in queriesResults" :key="queryIdx">
            <query-header-panel class="col"
                                :left='queryIdx === 0'
                                :comparison-options="['intersection']"
                                :comparable="comparableForQuery(queryIdx)"
                                :total="queryResult.total"
                                :title="queryResult.title"
                                :collections="collections"
                                :comparable-id="`p-${queryIdx}`"
                                @comparable-changed="comparable => onComparableUpdated(queryIdx, comparable)"/>
          </div>
        </div>
      </div>
      <!-- body -->
      <div class="aspects-container container-fluid">
        <div class="row"
             v-for="([facetId, facetType], facetIdx) in facets"
             v-bind:key="facetIdx">
          <div class="one-third" :class="{
            /* 'border-right mr-1px': !isLastResult(queryIdx), */
            'border-left': queryIdx > 0,
            'loading-bg': isQueryLoading(queryIdx),
            }"
            v-for="(queryResult, queryIdx) in queriesResults" :key="queryIdx">
            <div class="col" v-if="isQueryLoading(queryIdx)">
              <loading-indicator class="col py-3" v-if="facetIdx === 0"/>
            </div>
            <div class="col" v-if="!isQueryLoading(queryIdx) && getFacetValues(queryResult, facetId) === undefined">
              <div v-if="facetIdx === 0" style="text-align: center;">[Nothing found]</div>
            </div>
            <div class="col">
            <facet-overview-panel class="px-2"
                                  :facet="facetId"
                                  :type="facetType"
                                  :title="$tc(`label.${facetId}.title`, getFacetValues(queryResult, facetId).length || 1)"
                                  :values="getFacetValues(queryResult, facetId)"
                                  @timeline-highlight="onTimelineHighlight"
                                  @timeline-highlight-off="onTimelineHighlightOff"
                                  @hovered="onHovered"
                                  :hover-id="hoverId"
                                  :timeline-highlight-value="getTimelineHighlight(facetId).data"
                                  :timeline-highlight-enabled="getTimelineHighlight(facetId).enabled"
                                  :timeline-domain="timelineDomain"
                                  v-if="!isQueryLoading(queryIdx) && getFacetValues(queryResult, facetId) !== undefined" />
            </div>
          </div>
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import { protobuf } from 'impresso-jscommons';
import Collection from '@/models/Collection';
import { searchQueriesComparison, search, collections } from '@/services';
import FacetOverviewPanel from './modules/searchQueriesComparison/FacetOverviewPanel';
import QueryHeaderPanel from './modules/searchQueriesComparison/QueryHeaderPanel';
import LoadingIndicator from './modules/LoadingIndicator';
import Bucket from '../models/Bucket';

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

function getDomainForResults(results) {
  const facets = results.facets || [];
  const yearFacet = facets.filter(({ id }) => id === 'year')[0];

  if (!yearFacet) return [];

  const years = (yearFacet.buckets || []).map(({ val }) => val).sort();
  if (years.length > 0) return [years[0], years[years.length - 1]];
  return [];
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

const DefaultQuery = { filters: [{ type: 'hasTextContents' }] };

const QueryLeftIndex = 0;
const QueriesIntersectionIndex = 1;
const QueryRightIndex = 2;

export default {
  data: () => ({
    hoverId: '',
    // loading flags indicate that tab at flag's index is loading data
    // from the API.
    loadingFlags: [...Array(3).keys()].map(() => false),
    // [<facet id>, <facet visualisation method>]
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
    queriesResults: [
      { },
      { type: 'intersection' },
      { },
    ],
    // Timeline highlight (tooltip) data.
    // Used to synchronise all three timelines
    timelineHighlights: {},
    // list of available collections:
    collections: [],
    // comparable items: { type, query, id }
    // where type is one of ['collection', 'query']
    //       id is the ID of the collection if this is a collection
    //       query is a Search Query object.
    comparables: [
      { type: 'query', query: DefaultQuery },
      { type: 'query', query: DefaultQuery },
    ],
  }),
  watch: {
    // query parameters updated - this drives state change
    '$route.query': {
      handler(queryParameters) {
        const { left = '', right = '' } = queryParameters;
        const comparables = [left, right].map((item, idx) => {
          const parts = item.split(':');
          if (parts.length === 2 && parts[0] === 'c') return { type: 'collection', id: parts[1] };
          try {
            const query = item === ''
              ? DefaultQuery
              : protobuf.searchQuery.deserialize(item);
            return { type: 'query', query };
          } catch (e) {
            throw new Error(`Query ${idx} could not be parsed: ${e.message}`);
          }
        });
        this.$set(this, 'comparables', comparables);
      },
      immediate: true,
      deep: true,
    },
    // comparables are updated by the query paramters - fetching new data.
    comparables: {
      async handler([left, right] = [], [oldLeft, oldRight] = []) {
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

        return Promise.all(queries);
      },
      immediate: true,
      deep: true,
    },
  },
  // get collections on created.
  async created() {
    const { data } = await collections.find();
    this.collections = data.map(d => new Collection(d));
  },
  computed: {
    // the span of the domain to fit the widest result on timeline.
    timelineDomain() {
      const minAndMaxYears = this.queriesResults.map(getDomainForResults);
      const minimums = minAndMaxYears.map(([minYear]) => minYear).filter(y => y !== undefined);
      const maximums = minAndMaxYears.map(([, maxYear]) => maxYear).filter(y => y !== undefined);
      return [Math.min(...minimums), Math.max(...maximums)].filter(isFinite);
    },
  },
  components: {
    FacetOverviewPanel,
    QueryHeaderPanel,
    LoadingIndicator,
  },
  methods: {
    /** Get particular values out of a retuls object */
    getFacetValues(result, facetId) {
      if (result.facets === undefined) return undefined;
      const items = result.facets.filter(({ id }) => id === facetId);
      if (items.length === 0) return [];
      return items[0].buckets;
    },
    /** Fetch intersection data */
    async updateQueriesIntersectionResult(resultIndex, comparables) {
      const payload = {
        queries: comparables
          .map(comparableToQuery)
          .filter(query => query !== null && query !== undefined),
        limit: 0,
        facets: this.facets.map(([type]) => type),
      };

      if (payload.queries.length < 2) return;

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
    /** Fetch query data */
    async updateQueryResult(resultIndex, comparable) {
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
    /** Next three *timeline* methods are for synchronising timeline tooltips */
    onTimelineHighlight({ facetId, data }) {
      this.$set(this.timelineHighlights, facetId, { enabled: true, data: data.datum });
    },
    onTimelineHighlightOff({ facetId }) {
      this.timelineHighlights[facetId] = { enabled: false };
      this.$set(this.timelineHighlights, facetId, { enabled: false });
    },
    onHovered(val) {
      this.hoverId = String(val);
    },
    getTimelineHighlight(id) {
      return this.timelineHighlights[id] || {};
    },
    isQueryLoading(queryIndex) {
      return this.loadingFlags[queryIndex];
    },
    isLastResult(idx) {
      return this.queriesResults.length - 1 === idx;
    },
    asCollection(queryResult) {
      return {
        id: queryResult.id,
        title: queryResult.title,
      };
    },
    onComparableUpdated(queryIdx, comparable) {
      if (queryIdx !== 0 && queryIdx !== 2) return;
      const comparableIdx = queryIdx === 0 ? 0 : 1;

      const comparables = this.comparables.map(c => Object.assign({}, c));
      comparables[comparableIdx] = comparable;

      const queryParameters = constructQueryParameters(comparables, this.$route.query);
      this.$router.push({
        name: 'compare',
        query: queryParameters,
      });
    },
    comparableForQuery(queryIndex) {
      switch (queryIndex) {
        case 0:
          return this.comparables[0];
        case 1:
          return {
            type: 'intersection',
            filters: this.comparables
              .map(comparableToQuery)
              .reduce((acc, { filters }) => acc.concat(filters), []),
          };
        case 2:
          return this.comparables[1];
        default:
          throw new Error(`Unexpected queryIndex: ${queryIndex}`);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .loading-bg {
    background: #ececec87;
  }
  .pm-fixer {
    margin: 0;
    &:last-child {
      height: 100%;
    }
    flex-wrap: nowrap !important;
    width: 100%;
  }
  .one-third {
    flex: 1 1 auto !important;
    max-width: 33.33%;
    max-width: calc(100% / 3);
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
</style>

<i18n>
{
  "en": {
    "cta": {
      "select-collection": "Please select a collection"
    }
  }
}
</i18n>
