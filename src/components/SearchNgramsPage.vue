<template>
  <i-layout id="SearchNgramsPage">
    <!-- sidebar -->
    <i-layout-section width="400px" class="border-right">
      <!--  header -->
      <div slot="header" class="border-bottom bg-light">
        <search-tabs/>

        <div class="py-3 px-3">
          [ngram search input box placeholder]
        </div>
      </div>
      <!--  facets -->
      <div class="pt-3">
        <search-facets
          store="searchNgrams"
          @submit-facet="onFacetSubmitted"
          @update-filter="onFilterUpdated"
          @reset-filter="onFilterReset"/>
      </div>
    </i-layout-section>

    <!-- main section -->
    <i-layout-section class="border-left border-top ml-1px mt-1px">
      [placeholder]
    </i-layout-section>
  </i-layout>
</template>

<script>
import SearchTabs from '../components/modules/navigation/SearchTabs';
import SearchFacets from './SearchFacets';

export default {
  components: {
    SearchTabs,
    SearchFacets,
  },
  mounted() {
    this.executeSearch();
  },
  watch: {
    '$route.query': {
      handler(val) {
        this.$store.dispatch('searchNgrams/PULL_SEARCH_PARAMS', val);
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    executeSearch() {
      this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    },
    searchNgrams(args) {
      console.info('searchNgrams', args);
    },
    onFacetSubmitted(facet) {
      this.$store.commit('searchNgrams/ADD_FILTER', facet);
      this.executeSearch();
    },
    onFilterUpdated(filter) {
      this.$store.commit('searchNgrams/UPDATE_FILTER', filter);
      this.executeSearch();
    },
    onFilterReset(type) {
      this.$store.commit('searchNgrams/RESET_FILTER', type);
      this.executeSearch();
    },
  },
};
</script>

<i18n>
  {
    "en": {
      "tabs": {
        "text": "search articles",
        "images": "search images",
        "ngrams": "ngrams"
      }
    }
  }
</i18n>
