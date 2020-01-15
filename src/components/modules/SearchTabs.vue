<template lang="html">
  <b-tabs pills class="mx-2 pt-2">
    <template v-slot:tabs-end>
      <b-nav-item v-for="tab in tabs" v-bind:key="tab" active-class='none'
        :class="{ active: isActive(tab) }"
        :to="{ name: tab, query: currentSearchQueryParams(tab) }"><span v-html="$t(`tabs.${tab}`)"/>
      </b-nav-item>
    </template>
  </b-tabs>
</template>

<script>
export default {
  props: {
    focusOnSearch: Boolean,
    tabs: {
      type: Array,
      default: () => ['search', 'searchImages', 'searchNgrams'],
    },
  },
  methods: {
    currentSearchQueryParams(tab) {
      if (tab === 'search') {
        return this.$store.state.search.search.getSerialized();
      }
      return this.$store.state.searchImages.search.getSerialized();
    },
    isActive(tab) {
      if (this.focusOnSearch) {
        return tab === 'search';
      }
      return this.$route.name === tab;
    },
  },
};
</script>

<style lang="css" scoped>
</style>

<i18n>
{
  "en": {
    "tabs": {
      "search": "search articles",
      "searchImages": "search images",
      "searchNgrams": "ngrams"
    }
  }
}
</i18n>
