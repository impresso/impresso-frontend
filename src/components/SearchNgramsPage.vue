<template>
  <i-layout id="SearchNgramsPage">
    <!-- sidebar -->
    <i-layout-section width="400px">
      <!--  header -->
      <div slot="header" class="border-bottom bg-light">
        <search-tabs/>
        <div class="py-3 px-3">
          <search-pills
            :filters="allowedFilters"
            @changed="handleFiltersChanged"
          />
          <span v-if="filtersRemoved">
            <em class="small" v-html="$tc('numbers.filtersRemoved', filtersRemoved, {
              n: filtersRemoved,
            })"/>
            &nbsp;
            <info-button name="how-ngram-work-availble-filters"  />
          </span>
          <!-- <autocomplete v-on:submit="onAddFilter" /> -->
        </div>
      </div>
      <!--  facets -->
      <div class="pt-3">
        <p class="mx-3">
          <em>{{ $t('label.availableFacets') }}&nbsp;</em>
          <info-button name="how-ngram-work-use-of-facets"  />
        </p>
        <search-facets
          store="searchNgrams"
          @submit-facet="onAddFilter"
          @update-filter="onFilterUpdated"
          @reset-filter="onFilterReset"/>
      </div>
    </i-layout-section>

    <!-- main section -->
    <i-layout-section main>
      <div slot="header">
      <b-navbar class="d-flex p-0 border-bottom align-items-center">
        <b-navbar-nav class="border-right flex-grow-1 px-2 pl-3 py-2 ">
          <section class="search-results-summary text-serif textbox-fancy border-tertiary">
            <label>ngrams viewer</label>
            <ellipsis v-bind:initialHeight="60">
              <span v-if="unigram" v-html="$tc('numbers.unigramMentions', trend.total || 0, {
                unigram,
                n: $n(trend.total),
              })"></span>
              <span v-else v-html="$t('label.noUnigram')" />
              &nbsp;
              <span v-html="$tc('numbers.articles', trendBackground.total, {
                  n: $n(trendBackground.total),
                })" />
              &nbsp;
              <search-query-summary class="d-inline" :search-query="{ filters: allowedFilters }"/>
            </ellipsis>

          </section>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto px-2">
          <router-link
            :disabled="!unigram"
            class="btn btn-outline-primary btn-sm"
            :to="searchPageLink">
            {{ $t('label.seeArticles') }}
          </router-link>
        </b-navbar-nav>
      </b-navbar>
      <b-navbar class="border-bottom">
        <span style="white-space:nowrap" class="mr-3">Enter unigram</span>
        <search-input
          @submit="onNgramsSubmitted"
          placeholder="search ngrams ..."
          :initial="unigram">
        </search-input>
      </b-navbar>
    </div>
    <div class="m-3">
      <base-title-bar class="my-3">
        <span v-html="$t('label.timeline.unigramTitle')"/>
        <div slot="description">
        {{$t('label.timeline.unigramDescription')}}
        </div>
      </base-title-bar>
      <timeline
            v-if="trend.total > 0"
            :contrast="false"
            :values="timelineValues"
            :brushable="false"
            height="300px"
            :resolution="timelineResolution">
        <div slot-scope="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{ $d(tooltipScope.tooltip.item.t, timelineResolution, 'en') }} &middot;
            <span v-html="$tc('numbers.unigramMentions', tooltipScope.tooltip.item.w, {
              unigram,
              n: $n(tooltipScope.tooltip.item.w),
            })"/>&nbsp;
            <span v-html="$tc('numbers.articles', getArticlesInYear(tooltipScope.tooltip.item.t), {
                n: getArticlesInYear(tooltipScope.tooltip.item.t),
            })"></span>
          </div>
        </div>
      </timeline>
    </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import SearchTabs from '@/components/modules/SearchTabs';
// import Autocomplete from '@/components/Autocomplete';
import InfoButton from '@/components/base/InfoButton';
import BaseTitleBar from '@/components/base/BaseTitleBar';
import SearchPills from '@/components/SearchPills';
import SearchQuerySummary from '@/components/modules/SearchQuerySummary';
import SearchFacets from '@/components/SearchFacets';
import SearchInput from '@/components/modules/SearchInput';
import Timeline from '@/components/modules/Timeline';
import Ellipsis from '@/components/modules/Ellipsis';
import Helpers from '@/plugins/Helpers';

export default {
  name: 'SearchNgramsPage',
  components: {
    SearchTabs,
    SearchFacets,
    SearchInput,
    Timeline,
    SearchQuerySummary,
    Ellipsis,
    SearchPills,
    InfoButton,
    BaseTitleBar,
    // Autocomplete,
  },
  watch: {
    '$route.query': {
      handler(val) {
        console.info('searchNgramsPage @$route.query changed:', val);
        this.executeSearch();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getArticlesInYear(d) {
      if (!d) {
        return 0;
      }
      const y = d.getFullYear();
      return this.trendBackground.values[y] || 0;
    },
    executeSearch() {
      this.$store.dispatch('searchNgrams/PULL_SEARCH_PARAMS', this.$route.query);
    },
    onNgramsSubmitted({ q }) {
      this.$store.commit('searchNgrams/SET_UNIGRAM', q);
      this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    },
    handleFiltersChanged(filters) {
      this.$store.dispatch('searchNgrams/UPDATE_SEARCH_QUERY_FILTERS', filters)
      this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    },
    onAddFilter(facet) {
      this.$store.commit('searchNgrams/ADD_FILTER', facet);
      this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    },
    onFilterUpdated(filter) {
      this.$store.commit('searchNgrams/UPDATE_FILTER', filter);
      this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    },
    onFilterReset(type) {
      this.$store.commit('searchNgrams/RESET_FILTER', type);
      this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
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
      return Helpers.timeline.addEmptyIntervals(v, this.trend.timeInterval).sort((a, b) => a.t - b.t);
    },
    trend() {
      return this.$store.state.searchNgrams.trend;
    },
    trendBackground() {
      return this.$store.state.searchNgrams.trendBackground;
    },
    unigram() {
      return this.$store.state.searchNgrams.unigram;
    },
    searchQuery() {
      return this.$store.state.searchNgrams.search;
    },
    allowedFilters() {
      return this.searchQuery.filters.filter(d => !['string', 'regex'].includes(d.type));
    },
    filtersRemoved() {
      return this.searchQuery.filters.length - this.allowedFilters.length;
    },
    timelineResolution() {
      return this.trend.timeInterval;
    },
    searchPageLink() {
      const filters = [...this.allowedFilters, {
        type: 'string',
        precision: 'exact',
        q: this.unigram,
      }];
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
        "timeline": {
          "unigramTitle": "Number of unigram mentions per year",
          "unigramDescription": " "
        },
        "seeArticles": "See articles",
        "noUnigram": "... look for a specific <em>unigram</em> in",
        "availableFacets": "Available filters for ngram analysis"
      }
    }
  }
</i18n>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";
</style>
