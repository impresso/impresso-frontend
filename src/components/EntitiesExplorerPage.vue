<template lang="html">
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light" class="border-bottom" slot="header">
        <section>
          <div class="label small-caps">
            Entities
          </div>
          <h3>{{ $t('title') }}</h3>
          <div v-if="countActiveFilters > 0">
            <b-form-checkbox class="ml-auto" @change="useCurrentSearchChanged" switch>
              {{ $t('label.useCurrentSearch') }}
            </b-form-checkbox>
            <a href="#" size="sm" @click.prevent.stop="toggleQueryExplorerVisible">
              ({{ $tc('counts.filters', {count: countActiveFilters}) }})
            </a>
            <div class="bg-dark" v-if="searchQueryExplorerVisible">
              <search-query-explorer :search-query="searchQuery" dark-mode/>
            </div>
          </div>
        </section>
      </b-navbar>
    </template>
    <template v-slot:default>
      <section>
        <timeline>
        </timeline>
        <pre>{{entities}}</pre>
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
  },
  methods: {
    useCurrentSearchChanged() {
      console.log('useCurrentSearchChanged');
    },
    toggleQueryExplorerVisible() {
      this.searchQueryExplorerVisible !== this.searchQueryExplorerVisible;
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
