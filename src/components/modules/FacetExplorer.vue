<template lang="html">
  <div class="">
    {{facetType}}
    <div v-for="bucket in facets" class="">
      <!-- {{ bucket.item.name }} -->
    </div>
    <pre>{{ facets }}</pre>
  </div>
</template>

<script>
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
};
</script>

<style lang="css" scoped>
</style>
