<template lang="html">
  <b-tabs pills class="mx-2 pt-2">
    <template v-slot:tabs-end>
      <b-nav-item v-for="(tab, i) in tabs" v-bind:key="i" active-class='none'
        :class="{ active: isActive(tab) }"
        :to="{ name: tab, query: currentSearchQueryParams }"><span v-html="$t(`tabs.${tab}`)"/>
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
  computed: {
    selectedTab() {
      if (this.tabs.includes(this.$route.name)) {
        return this.$route.name;
      }
      return 'search';
    },
    currentSearchQueryParams() {
      const searchQuery = this.$store.state[this.selectedTab].search;
      return searchQuery.getSerialized();
    },
  },
  methods: {
    isActive(tab) {
      return this.selectedTab === tab;
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
