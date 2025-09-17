<template>
  <div>
    <b-container fluid class="my-3">
      <!-- <h2>Facets – top ten buckets</h2> -->
      <b-row>
        <b-col sm="12" md="12" lg="6" xl="4" v-for="(facet, idx) in facets" v-bind:key="idx">
          <StackedBarsPanel
            class=""
            :label="facet.type"
            :buckets="facet.buckets"
            :facet-type="facet.type"
            :search-index="searchIndex"
          />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import Facet from '@/models/Facet'
import { getSearchFacetsService } from '@/services'

export default {
  name: 'TextReuseOverview',
  components: {
    StackedBarsPanel: defineAsyncComponent(
      () => import('@/components/modules/vis/StackedBarsPanel.vue')
    )
  },
  props: {
    filters: {
      type: Array,
      default: () => []
    },
    loading: Boolean,
    searchIndex: {
      type: String,
      default: 'tr_passages'
    }
  },
  data: () => ({
    facets: ['newspaper', 'country', 'language', 'person', 'location', 'topic'].map(
      type => new Facet({ type })
    )
  }),
  computed: {
    /** @returns {{ query: any, hash: string }} */
    searchFacetApiQueryParams() {
      const query = {
        limit: 10,
        order_by: '-count',
        page: 1,
        filters: this.filters
      }
      // eslint-disable-next-line
      console.debug('[TextReuse] searchFacetApiQueryParams', query)
      return {
        query,
        hash: JSON.stringify(query).split('').sort().join('')
      }
    }
  },
  methods: {
    loadFacets(types, opts = {}) {
      // eslint-disable-next-line
      console.debug(
        '[TextReuseOverview] loadFacets',
        types,
        'query',
        this.searchFacetApiQueryParams.query
      )
      getSearchFacetsService(this.searchIndex)
        .find({
          query: {
            facets: types,
            ...this.searchFacetApiQueryParams.query,
            ...opts
          }
        })
        .then(result => {
          result.data.forEach(result => {
            const facet = this.facets.find(facet => result.type === facet.type)
            if (facet) {
              facet.numBuckets = result.numBuckets
              facet.setBuckets(result.buckets)
            }
          })
        })
    }
  },
  watch: {
    searchFacetApiQueryParams: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug('[TextReuse] @searchApiQueryParameters \n query:', query)
        await this.loadFacets([
          'newspaper',
          'type',
          'country',
          'language',
          'person',
          'location',
          'topic'
        ])
      },
      immediate: true,
      deep: false
    }
  }
}
</script>
