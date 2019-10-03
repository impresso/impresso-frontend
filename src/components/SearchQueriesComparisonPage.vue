<template lang="html">
  <i-layout id="SearchQueriesComparisonPage">
    <i-layout-section>
      <div slot="header" class="header row border-bottom pm-fixer">
        <div :class="`px-3 one-third ${queryIdx === getQueryResults().length - 1 ? '' : 'border-right'}`" 
             v-for="(queryResult, queryIdx) in getQueryResults()" :key="queryIdx">
          <query-header-panel class="col"
                              :type="queryResult.type"
                              :title="queryResult.title" />
        </div>
      </div>

      <div class="aspects-container">
        <div class="row pm-fixer"
             v-for="([id, title, type], idx) in facets"
             v-bind:key="idx">
          <div :class="`px-3 one-third ${queryIdx === getQueryResults().length - 1 ? '' : 'border-right'}`" 
               v-for="(queryResult, queryIdx) in getQueryResults()" :key="queryIdx">
            <loading-indicator class="col loading-bg" v-if="isQueryLoading(queryIdx) && idx === 0"/>
            <div class="col loading-bg" v-if="isQueryLoading(queryIdx) && idx !== 0"/>
            <div class="col" v-if="getFacetValues(queryResult, id) === undefined">
              <div v-if="idx === 0" style="text-align: center;">[Nothing found]</div>
            </div>
            <facet-overview-panel class="col"
                                  :facet="id" 
                                  :type="type" 
                                  :title="title"
                                  :values="getFacetValues(queryResult, id)"
                                  @timeline-highlight="onTimelineHighlight"
                                  @timeline-highlight-off="onTimelineHighlightOff"
                                  :timeline-highlight-value="getTimelineHighlight(id).data"
                                  :timeline-highlight-enabled="getTimelineHighlight(id).enabled"
                                  v-if="!isQueryLoading(queryIdx) && getFacetValues(queryResult, id) !== undefined"/>
          </div>
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import { searchQueriesComparison } from '@/services';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';
import FacetOverviewPanel from './modules/searchQueriesComparison/FacetOverviewPanel';
import QueryHeaderPanel from './modules/searchQueriesComparison/QueryHeaderPanel';
import LoadingIndicator from './modules/LoadingIndicator';

function prepareFacets(responseFacets = {}) {
  const keys = Object.keys(responseFacets).filter(k => k !== 'count');
  return keys.map((key) => {
    const buckets = responseFacets[key].buckets || [];
    return {
      id: key,
      buckets: buckets.map(({ val, count }) => ({ val, count })),
    };
  });
}

export default {
  data: () => ({
    ids: [],
    loadingFlags: [...Array(3).keys()].map(() => false),
    facets: [
      ['year', 'Year', 'timeline'],
      ['newspaper', 'Newspaper', 'bars'],
      ['country', 'Country', 'bars'],
    ],
    queryResultLeft: {
      type: 'collection',
      title: 'Foo 1',
      facets: [
        {
          id: 'year',
          buckets: [...Array(180).keys()]
            .map(x => ({ val: 1840 + x, count: Math.round(x * 1000 * Math.random()) })),
        },
        {
          id: 'newspaper',
          buckets: [...Array(Math.round(Math.random() * 10)).keys()]
            .map(x => ({ val: `Paper ${x}`, count: x * 100 * Math.random() })),
        },
        {
          id: 'country',
          buckets: [...Array(Math.round(Math.random() * 5)).keys()]
            .map(x => ({ val: `State ${x}`, count: x * 500 * Math.random() })),
        },
        {
          id: 'trump',
          buckets: [...Array(Math.round(Math.random() * 50)).keys()]
            .map(x => ({ val: `Mention ${x}`, count: x * 500 * Math.random() })),
        },
      ],
    },
    queryResultRight: {
      type: 'collection',
      title: 'Bar 2',
      facets: [
        {
          id: 'year',
          buckets: [...Array(180).keys()]
            .map(x => ({ val: 1840 + x, count: Math.round(x * 1000 * Math.random()) })),
        },
        {
          id: 'newspaper',
          buckets: [...Array(Math.round(Math.random() * 10)).keys()]
            .map(x => ({ val: `Paper ${x}`, count: x * 100 * Math.random() })),
        },
        {
          id: 'country',
          buckets: [...Array(Math.round(Math.random() * 5)).keys()]
            .map(x => ({ val: `State ${x}`, count: x * 500 * Math.random() })),
        },
      ],
    },
    queriesIntersectionResult: { type: 'intersection' },
    timelineHighlights: {
      year: { enabled: false },
    },
  }),
  watch: {
    '$route.params.ids': {
      handler(ids) {
        this.ids = typeof ids === 'string' ? ids.split(',') : ids;
        this.loadIntersectedArticles(ids);
      },
      immediate: true,
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
    async loadIntersectedArticles(ids) {
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

      this.loadingFlags[1] = true;
      try {
        const result = await searchQueriesComparison.create(payload, { query: { method: 'intersection' } });
        this.queriesIntersectionResult = {
          type: 'intersection',
          facets: prepareFacets(result.info.facets),
        };
        console.info('Intersection data', JSON.stringify(this.queriesIntersectionResult));
      } finally {
        this.loadingFlags[1] = false;
      }
    },
    onTimelineHighlight({ facetId, data }) {
      this.timelineHighlights[facetId] = { enabled: true, data: data.datum };
    },
    onTimelineHighlightOff({ facetId }) {
      this.timelineHighlights[facetId] = { enabled: false };
    },
    getTimelineHighlight(id) {
      return this.timelineHighlights[id] || {};
    },
    isQueryLoading(queryIndex) {
      return this.loadingFlags[queryIndex];
    },
    getQueryResults() {
      return [
        this.queryResultLeft,
        this.queriesIntersectionResult,
        this.queryResultRight,
      ];
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
  }
</style>

<i18n>
{
  "en": {
    "label_intersection": "Intersection"
  },
  "nl": {
    "label_intersection": "Overlap"
  }
}
</i18n>