<template>
  <i-layout id="SearchNgramsPage">
    <!-- sidebar -->
    <i-layout-section width="400px" class="border-right">
      <!--  header -->
      <div slot="header" class="border-bottom bg-light">
        <search-tabs/>

        <div class="py-3 px-3">
          <search-input @submit="onNgramsSubmitted" placeholder="search ngrams ..."></search-input>
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
      <timeline
            :contrast="false"
            :values="timelineValues"
            :brushable="false"
            :height="null">
        <div slot-scope="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{ $d(tooltipScope.tooltip.item.t, 'year', 'en') }} &middot;
            <b v-html="$tc('numbers.results', tooltipScope.tooltip.item.w, {
              n: $n(tooltipScope.tooltip.item.w),
            })"/>
          </div>
        </div>
      </timeline>
    </i-layout-section>
  </i-layout>
</template>

<script>
import SearchTabs from './modules/SearchTabs';
import SearchFacets from './SearchFacets';
import SearchInput from './modules/SearchInput';
import Timeline from './modules/Timeline';
import Helpers from '../plugins/Helpers';

export default {
  components: {
    SearchTabs,
    SearchFacets,
    SearchInput,
    Timeline,
  },
  mounted() {
    this.executeSearch();
  },
  watch: {
    '$route.query': {
      async handler(val) {
        await this.$store.dispatch('searchNgrams/PULL_SEARCH_PARAMS', val);
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    executeSearch() {
      this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    },
    onNgramsSubmitted({ q }) {
      this.$store.commit('searchNgrams/SET_UNIGRAM', q);
      this.executeSearch();
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
  computed: {
    timelineValues() {
      const pairs = (this.trend.values || []).map((value, idx) => {
        const domainValue = this.trend.domain[idx];
        return [domainValue, value];
      });
      const v = pairs
        .map(([d, val]) => ({ t: parseInt(d, 10), w: val }));
      return Helpers.timeline.addEmptyYears(v);
    },
    trend() {
      return this.$store.state.searchNgrams.trend;
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

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";

  // .d3-timeline {
  //   height: 100% !important;
  // }
</style>
