<template lang="html">
  <div class="">
    {{facetType}}
    <button @click="getFacets(1)" type="button" name="button">get facets</button>
    <div v-for="(facet, index) in facets" class="border-top mx-3 py-2 mb-2">
      <filter-facet :facet="facet"
        store="search"
        @submit-buckets="submitBuckets"
        @update-filter="updateFilter"
        @reset-filter="resetFilter"/>
    </div>
    <pre>{{ facets }}</pre>
  </div>
</template>

<script>
import FilterFacet from './FilterFacet';

export default {
  props: {
    facetType: String,
  },
  computed: {
    currentStore() {
      if (this.store === 'searchImages') {
        return this.$store.state.searchImages;
      }
      return this.$store.state.search;
    },
    facets: {
      get() {
        return this.currentStore.facets.filter(facet => facet.type === this.facetType);
      },
    },
  },
  components: {
    FilterFacet,
  },
  methods: {
    getFacets(page) {
      console.log('getfacets', page);
      // if (page !== undefined) {
      //   this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      // }

      // const facet = { type: 'person' };
      // this.$store.commit('search/UPDATE_FACET', facet);
      this.$store.dispatch('search/LOAD_SEARCH_FACETS', {
        facets: [
          this.facetType,
        ],
      }).then((e) => {
        console.log(e, this.facets);
      });
    },
    updateFilter(filter) {
      this.$emit('update-filter', filter);
    },
    resetFilter(type) {
      this.$emit('reset-filter', type);
    },
    submitBuckets({ type, context, ids }) {
      this.$emit('submit-facet', {
        type,
        context,
        q: ids,
        exclusive: true,
      });
    },
  },
};
</script>

<style lang="css" scoped>
</style>
