<template lang="html">
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light" class="border-bottom" slot="header">
        <section v-if="observingList">
          <div class="label small-caps">
            Entities
          </div>
          <h3>{{ $t('title') }}</h3>
          <div v-if="countActiveFilters > 0">
            <b-form-checkbox
              v-model="useCurrentSearch"
              @change="useCurrentSearchChanged" switch>
              {{ $t('label.useCurrentSearch') }}
              <a @click.prevent.stop="toggleQueryExplorerVisible">
                ({{ $tc('counts.filters', countActiveFilters) }})
              </a>
              <div class="bg-dark" v-if="searchQueryExplorerVisible">
                <search-query-explorer :search-query="searchQuery" dark-mode/>
              </div>
            </b-form-checkbox>
          </div>
        </section>
        <section v-else>
          <p class="pt-3">Please add a few entities and be amazed.</p>
        </section>
      </b-navbar>
    </template>
    <template v-slot:default>
      <section v-if="$route.query.items" class="p-3">
        <timeline
          :class="{'invisible': !timelineVisible}"
          :values="timevalues"
          :domain="domain"
          height="120px"
          >
          <div slot-scope="tooltipScope">
            <div v-if="tooltipScope.tooltip.item">
              {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
              <b>{{ tooltipScope.tooltip.item.w }}</b> {{ localComputedVar }}
            </div>
          </div>
        </timeline>
        <pre>{{searchQuery}}</pre>
      </section>
    </template>
  </i-layout-section>
</template>

<script>
import Timeline from './modules/Timeline';
import SearchQueryExplorer from './modals/SearchQueryExplorer';
import { searchQueryGetter } from '@/logic/queryParams';

export default {
  data: () => ({
    searchQueryExplorerVisible: false,
    useCurrentSearch: false,
    timelineVisible: false,
    timevalues: [],
    domain: [1800, 2000],
  }),
  components: {
    Timeline,
    SearchQueryExplorer,
  },
  computed: {
    searchQuery: searchQueryGetter(),
    countActiveFilters() {
      return this.searchQuery.countActiveFilters();
    },
    observingList() {
      return this.$route.query.items ? this.$route.query.items.split(',') : [];
    }
  },
  methods: {
    useCurrentSearchChanged() {
      this.useCurrentSearch = !this.useCurrentSearch;
      this.$router.push({ query: { ...this.$route.query, useCurrentSearch: this.useCurrentSearch }})
    },
    toggleQueryExplorerVisible() {
      this.searchQueryExplorerVisible = !this.searchQueryExplorerVisible;
    },
    loadFacets({type, q}) {
      this.timelineVisible = false;
      let filters = [{type, q, op: "OR"}];
      if (this.useCurrentSearch) {
        filters = filters.concat(this.searchQuery.getFilters());
      }
      console.log('___filters', filters);
      return this.$store.dispatch('search/LOAD_TIMELINE', {filters}).then((values) => {
        this.timevalues = values;
        this.timelineVisible = true;
      });
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler() {
        this.loadFacets({type: 'entity', q: this.observingList});
      },
    },
  },
};
</script>

<style lang="css" scoped>
</style>

<i18n>
{
  "en": {
    "title": "Timeline of observed Named Entities"
  }
}
</i18n>
