<template>
  <div class="p-2 container">

    <b-tabs pills content-class="mt-3"
            v-if="comparable.type !== 'intersection'">
      <!-- query -->
      <b-tab
             :active="comparable.type === 'query'"
             :title="getTabLabel('query')"
             @click="typeChanged('query')">
        <div class="px-1 pb-2">
          <search-pills v-on:remove="onRemoveFilter"
                        v-on:update="onUpdateFilter"
                        v-on:add="onAddFilter"
                        :skip-push-search-params="true"
                        :search-filters="searchQuery.filters"
                        store-module-name="queryComparison"
                        :search-query-id="comparableId"
                        enable-add-filter
                        />
          <autocomplete v-on:submit="onSuggestion" />
        </div>
      </b-tab>
      <!-- collection -->
      <b-tab
             :active="comparable.type === 'collection'"
             :title="getTabLabel('collection')"
             @click="typeChanged('collection')">
        <dropdown :options="collectionsOptions"
                  :value="comparable.id"
                  @input="setCollectionId"
                  variant="light"/>
      </b-tab>
    </b-tabs>

    <!-- intersection -->
    <div class="row justify-content-between" v-if="comparable.type === 'intersection'">
      <div class="col-auto align-self-start">
        <h3>{{title}}</h3>
      </div>
      <div class="col-auto align-self-start">
        <div v-if="comparable.type" class="badge badge-secondary type d-flex">
          <span class="small-caps d-flex">{{comparable.type}}</span>
        </div>
      </div>
    </div>



  </div>
</template>

<script>
// import { mapState } from 'vuex'

import Dropdown from '../../layout/Dropdown';
import SearchPills from '../../SearchPills';
import Autocomplete from '../../Autocomplete';

export default {
  data: () => ({
    lastQuery: undefined,
  }),
  props: {
    comparable: {
      // A { id, type, query } object
      type: Object,
      default() { return {}; },
    },
    title: {
      type: String,
    },
    total: Number, // total items in selected collection.
    collections: {
      type: Array, // An array of `{ title, id }` objects for the dropdown box
      default() { return []; },
    },
    comparableId: {
      type: String,
      default: undefined,
    },
    query: {
      type: Object,
      default() { return { filters: [] }; },
    },
  },
  components: {
    Dropdown,
    SearchPills,
    Autocomplete,
  },
  watch: {
    'comparable.query': {
      handler() {
        const { comparableId: searchQueryId, comparable: { query = { filters: [] } } } = this;
        const { filters } = query;
        this.$store.dispatch('queryComparison/SET_SEARCH_QUERY_FILTERS', { searchQueryId, filters });
        if (this.comparable.query) {
          this.$set(this, 'lastQuery', this.comparable.query);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    getTabLabel(type) {
      if (type === this.comparable.type) {
        return this.$tc(`tabs.${type}.active`, this.total, {
          count: this.$n(this.total),
        });
      }
      return this.$t(`tabs.${type}.pick`);
    },
    setCollectionId(id) {
      const comparable = Object.assign({}, this.comparable, { id });
      this.$emit('comparable-changed', comparable);
    },
    typeChanged(newType) {
      this.comparable.type = newType;
      if (newType === 'query' && !this.comparable.query && this.lastQuery) {
        this.comparable.query = this.lastQuery;
      }
      this.$emit('comparable-changed', this.comparable);
    },
    onSuggestion(filter) {
      const { comparableId: searchQueryId } = this;
      this.$store.dispatch('queryComparison/ADD_FILTER', { searchQueryId, filter });

      this.comparable.query = this.canonicalSearchQuery;
      this.$emit('comparable-changed', this.comparable);
    },
    onRemoveFilter(filter) {
      const { comparableId: searchQueryId } = this;
      this.$store.dispatch('queryComparison/REMOVE_FILTER', { searchQueryId, filter });

      this.comparable.query = this.canonicalSearchQuery;
      this.$emit('comparable-changed', this.comparable);
    },
    onAddFilter(filter) {
      this.onSuggestion(filter);
    },
    onUpdateFilter() {
      this.comparable.query = this.canonicalSearchQuery;
      this.$emit('comparable-changed', this.comparable);
    },
  },
  computed: {
    collectionsOptions() {
      const options = this.collections.map(({ title, id }) => ({ text: title, value: id }));
      if (!options.find(o => o.value === this.comparable.id)) {
        options.unshift({
          text: this.title || 'Select a collection',
          value: this.comparable.id,
        });
      }
      return options;
    },
    searchQuery() {
      return this.$store.getters['queryComparison/getSearchQuery'](this.comparableId);
    },
    canonicalSearchQuery() {
      return {
        filters: this.$store.getters['queryComparison/getSearchQuery'](this.comparableId).getFilters(),
      };
    },
  },
};
</script>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";

  .type {
    .small-caps {
      height: 17px;
      vertical-align: top;
    }
  }
</style>

<i18n>
{
  "en": {
    "tabs": {
      "collection": {
        "active": "collection | collection (1 result) | collection ({count} results)",
        "pick": "collection"
      },
      "query": {
        "active": "query | query (1 result) | query ({count} results)",
        "pick": "query"
      }
    }
  }
}
</i18n>
