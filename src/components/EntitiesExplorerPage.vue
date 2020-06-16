<template lang="html">
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light" class="border-bottom" slot="header">
        <section v-if="observingList.length">
          <div class="label small-caps">
            Entities
          </div>
          <h3>{{ $t('title') }}</h3>
          <div v-if="countActiveFilters > 0">
            <b-form-checkbox @change="useCurrentSearchChanged" switch>
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
      </b-navbar>
    </template>
    <template v-slot:default>
      <section v-if="$route.query.items.length" class="p-3">
        <timeline
          :values="timevalues"
          :domain="domain"
          height="120px"
          />
        <!-- <pre>{{searchQuery}}</pre> -->
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
      return this.$route.query.items;
    }
  },
  methods: {
    useCurrentSearchChanged() {
      console.log('useCurrentSearchChanged');
    },
    toggleQueryExplorerVisible() {
      this.searchQueryExplorerVisible = !this.searchQueryExplorerVisible;
    },
    loadFacets(items) {
      return this.$store.dispatch('entities/LOAD_TIMELINE', items).then((values) => {
        this.timevalues = values;
      });
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler() {
        this.loadFacets(this.observingList);
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
