<template lang="html">
  <i-layout id="SearchQueriesComparisonPage">
    <i-layout-section>
      <div slot="header" class="header row border-bottom pm-fixer">
        <div :class="`px-3 one-third ${isLastResult(queryIdx) ? '' : 'border-right'}`" 
             v-for="(queryResult, queryIdx) in queriesResults" :key="queryIdx">
          <query-header-panel class="col"
                              :type="queryResult.type"
                              :title="queryResult.title"
                              :total="queryResult.total"/>
        </div>
      </div>

      <div class="aspects-container">
        <div class="row pm-fixer"
             v-for="([facetId, facetType], facetIdx) in facets"
             v-bind:key="facetIdx">
          <div :class="`px-3 one-third ${isLastResult(queryIdx) ? '' : 'border-right'} ${isQueryLoading(queryIdx) ? 'loading-bg' : ''}`" 
               v-for="(queryResult, queryIdx) in queriesResults" 
               :key="queryIdx">
            <div class="col" v-if="isQueryLoading(queryIdx)">
              <loading-indicator class="col py-3" v-if="facetIdx === 0"/>
            </div>
            <div class="col" v-if="!isQueryLoading(queryIdx) && getFacetValues(queryResult, facetId) === undefined">
              <div v-if="facetIdx === 0" style="text-align: center;">[Nothing found]</div>
            </div>
            <facet-overview-panel class="col"
                                  :facet="facetId" 
                                  :type="facetType" 
                                  :title="$tc(`label.${facetId}.title`, getFacetValues(queryResult, facetId).length || 1)"
                                  :values="getFacetValues(queryResult, facetId)"
                                  @timeline-highlight="onTimelineHighlight"
                                  @timeline-highlight-off="onTimelineHighlightOff"
                                  :timeline-highlight-value="getTimelineHighlight(facetId).data"
                                  :timeline-highlight-enabled="getTimelineHighlight(facetId).enabled"
                                  :timeline-domain="timelineDomain"
                                  v-if="!isQueryLoading(queryIdx) && getFacetValues(queryResult, facetId) !== undefined"/>
          </div>
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import Vue from 'vue';

import { searchQueriesComparison, search } from '@/services';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';
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

const QueryLeftIndex = 0;
const QueriesIntersectionIndex = 1;
const QueryRightIndex = 2;

export default {
  data: () => ({
    loadingFlags: [...Array(3).keys()].map(() => false),
    facets: [
      // [<facet id>, <facet visualisation method>]
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
    // timelineDomain: [],
    queriesResults: [
      { },
      { type: 'intersection' },
      { },
    ],
    timelineHighlights: {},
  }),
  watch: {
    '$route.params.ids': {
      async handler(ids) {
        const [leftId, rightId] = typeof ids === 'string' ? ids.split(',') : ids;

        return Promise.all([
          this.updateQueriesIntersectionResult(QueriesIntersectionIndex, [leftId, rightId]),
          this.updateQueryResult(QueryLeftIndex, leftId),
          this.updateQueryResult(QueryRightIndex, rightId),
        ]);
      },
      immediate: true,
    },
  },
  computed: {
    timelineDomain() {
      const minAndMaxYears = this.queriesResults.map(getDomainForResults);
      const minimums = minAndMaxYears.map(([minYear]) => minYear).filter(y => y !== undefined);
      const maximums = minAndMaxYears.map(([, maxYear]) => maxYear).filter(y => y !== undefined);
      return [Math.min(...minimums), Math.max(...maximums)];
    },
  },
  components: {
    SearchResultsTilesItem,
    FacetOverviewPanel,
    QueryHeaderPanel,
    LoadingIndicator,
  },
  methods: {
    getFacetValues(result, facetId) {
      if (result.facets === undefined) return undefined;
      const items = result.facets.filter(({ id }) => id === facetId);
      if (items.length === 0) return [];
      return items[0].buckets;
    },
    async updateQueriesIntersectionResult(resultIndex, ids) {
      const payload = {
        queries: ids.map(id => ({
          filters: [
            {
              type: 'collection',
              q: id,
            },
          ],
        })),
        limit: 0,
        facets: this.facets.map(([type]) => type),
      };

      this.loadingFlags[resultIndex] = true;
      try {
        const result = await searchQueriesComparison.create(payload, { query: { method: 'intersection' } });
        const resultValue = {
          type: 'intersection',
          title: 'In both collections',
          facets: prepareFacets(result.info.facets),
          total: result.total,
        };
        Vue.set(this.queriesResults, resultIndex, resultValue);
        // console.info('Intersection data', JSON.stringify(this.queriesResults[resultIndex]));
      } finally {
        this.loadingFlags[resultIndex] = false;
      }
    },
    async updateQueryResult(resultIndex, id) {
      const payload = {
        filters: [
          {
            type: 'collection',
            q: id,
          },
        ],
        limit: 0,
        facets: this.facets.map(([type]) => type),
        group_by: 'articles',
      };

      this.loadingFlags[resultIndex] = true;
      try {
        const result = await search.find({ query: payload });
        const resultValue = {
          type: 'collection',
          title: `Query ${resultIndex === 0 ? 'left' : 'right'}`,
          facets: prepareFacets(result.info.facets),
          total: result.total,
        };
        // https://vuejs.org/v2/guide/list.html#Caveats
        Vue.set(this.queriesResults, resultIndex, resultValue);
        // console.info(`Data for query ${id}`, JSON.stringify(this.queriesResults[resultIndex]));
      } finally {
        this.loadingFlags[resultIndex] = false;
      }
    },
    onTimelineHighlight({ facetId, data }) {
      Vue.set(this.timelineHighlights, facetId, { enabled: true, data: data.datum });
    },
    onTimelineHighlightOff({ facetId }) {
      this.timelineHighlights[facetId] = { enabled: false };
      Vue.set(this.timelineHighlights, facetId, { enabled: false });
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
  }
</style>
