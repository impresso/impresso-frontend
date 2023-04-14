<template>
  <div>
    <b-container fluid class="my-3">
      <!-- <h2>Facets – top ten buckets</h2> -->
      <b-row>
        <b-col sm="12" md="12" lg="6" xl="4" v-for="(facet, idx) in facets" v-bind:key="idx">
          <stacked-bars-panel
            class=""
            :label="facet.type"
            :buckets="facet.buckets"
            :facet-type="facet.type"
          />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Facet from '@/models/Facet'
import { searchFacets } from '@/services'

export default {
  name: 'TextReuseOverview',
  components: {
    StackedBarsPanel: () => import('@/components/modules/vis/StackedBarsPanel'),
  },
  props: {
    filters: {
      type: Array,
      default: () => [],
    },
    loading: Boolean,
  },
  data: () => ({
    facets: [
      'newspaper',
      'country',
      'type',
      'language',
      'person',
      'location',
      'topic',
      'partner',
      'accessRight',
    ].map(type => new Facet({ type })),
  }),
  computed: {
    /** @returns {{ query: any, hash: string }} */
    searchFacetApiQueryParams() {
      const query = {
        index: 'tr_passages',
        limit: 10,
        order_by: '-count',
        page: 1,
        filters: this.filters,
      }
      // eslint-disable-next-line
      console.debug('[TextReuse] searchFacetApiQueryParams', query)
      return {
        query,
        hash: JSON.stringify(query)
          .split('')
          .sort()
          .join(''),
      }
    },
  },
  methods: {
    loadFacet(type, opts = {}) {
      // eslint-disable-next-line
      console.debug(
        '[TextReuseOverview] loadFacet',
        type,
        'query',
        this.searchFacetApiQueryParams.query,
      )
      searchFacets
        .get(type, {
          query: {
            ...this.searchFacetApiQueryParams.query,
            ...opts,
          },
        })
        .then(response => {
          response.forEach(result => {
            const facet = this.facets.find(facet => result.type === facet.type)
            if (facet) {
              facet.numBuckets = result.numBuckets
              facet.setBuckets(result.buckets)
            }
          })
        })
    },
  },
  watch: {
    searchFacetApiQueryParams: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug('[TextReuse] @searchApiQueryParameters \n query:', query)
        await this.loadFacet('newspaper')
        await this.loadFacet('type,country')
        await this.loadFacet('language')
        await this.loadFacet('person,location')
        await this.loadFacet('topic')
      },
      immediate: true,
      deep: false,
    },
  },
}
</script>
