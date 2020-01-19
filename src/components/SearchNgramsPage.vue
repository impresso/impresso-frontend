<template>
  <i-layout id="SearchNgramsPage">
    <!-- sidebar -->
    <i-layout-section width="400px" class="border-right">
      <!--  header -->
      <div slot="header" class="border-bottom bg-light">
        <search-tabs/>

        <div class="py-3 px-3">
          <search-input
            @submit="onNgramsSubmitted"
            placeholder="search ngrams ..."
            :initial="unigram">
          </search-input>
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
    <i-layout-section class="border-left border-top ml-1px mt-1px" main>

      <b-navbar type="light" variant="light" class="border-bottom py-0 px-3">
        <b-navbar-nav class="border-right flex-grow-1  py-2 ">
          <section class="search-results-summary text-serif textbox-fancy border-tertiary">
            <span v-if="!unigram">Enter unigram</span>
            <span v-if="unigram" v-html="$tc('numbers.unigramMentions', trend.total || 0, { unigram, n: trend.total })"></span>
            <router-link
              v-if="unigram && trend.total > 0"
              class="btn btn-outline-primary btn-sm"
              :to="searchPageLink">
              {{ $t('label.seeArticles') }}
            </router-link>
          </section>
        </b-navbar-nav>
      </b-navbar>

      <timeline
            v-if="trend.total > 0"
            :contrast="false"
            :values="timelineValues"
            :brushable="false"
            :height="'80%'">
        <div slot-scope="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{ $d(tooltipScope.tooltip.item.t, 'year', 'en') }} &middot;
            <b v-html="$tc('numbers.unigramMentions', tooltipScope.tooltip.item.w, {
              unigram,
              n: $n(tooltipScope.tooltip.item.w),
            })"/>
          </div>
        </div>
      </timeline>
    </i-layout-section>
  </i-layout>
</template>

<script>
import SearchTabs from '@/components/modules/SearchTabs';
import SearchFacets from '@/components/SearchFacets';
import SearchInput from '@/components/modules/SearchInput';
import Timeline from '@/components/modules/Timeline';
import Helpers from '@/plugins/Helpers';

export default {
  name: 'SearchNgramsPage',
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
    filters: {
      async handler() {
        await this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
      },
      deep: true,
    },
  },
  methods: {
    executeSearch() {
      this.$store.dispatch('searchNgrams/SEARCH');
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
        .map(([d, val]) => ({ t: new Date(d), w: val }));
      return Helpers.timeline.addEmptyIntervals(v, this.trend.timeInterval);
    },
    trend() {
      return this.$store.state.searchNgrams.trend;
    },
    unigram() {
      return this.$store.state.searchNgrams.unigram;
    },
    filters() {
      return this.$store.state.searchNgrams.search.filters;
    },
    searchPageLink() {
      const filters = this.$store.state.searchNgrams.search.getFilters();
      filters.push({
        type: 'string',
        precision: 'exact',
        q: this.unigram,
      });
      const query = {
        f: JSON.stringify(filters),
      };
      return { name: 'search', query };
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
      },
      "label": {
        "seeArticles": "See articles"
      }
    }
  }
</i18n>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";
</style>
