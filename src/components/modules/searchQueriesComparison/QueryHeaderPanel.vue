<template lang="html">
  <div class="query-header-panel">
  <div class="inner" :class="{
    left,
    right: !left && !containsComparison,
    middle: containsComparison,
  }">
  <div class="p-2 container">
    <b-tabs pills content-class="mt-3" :align="alignment"
            v-if="comparable.type !== 'intersection'">
      <!-- query -->
      <b-tab v-if="left" disabled>
        <template v-slot:title>
          <div class="side left">A</div>
        </template>
      </b-tab>
      <b-tab
             :active="comparable.type === 'query'"
             :title="getTabLabel('query')"
             @click="typeChanged('query')">
        <div class="px-1 pb-2">
          <search-pills enable-add-filter
                        :filters="searchQuery.filters"
                        @changed="handleFiltersChanged" />
          <autocomplete v-on:submit="onSuggestion" />
        </div>
      </b-tab>
      <!-- collection -->
      <b-tab
        :active="comparable.type === 'collection'"
        :title="getTabLabel('collection')"
        @click="typeChanged('collection')">
        <collection-picker
          class="mx-1"
          :collections="collections"
          :active="comparable.id"
          @input="onCollectionSelected"
          />
      </b-tab>
      <b-tab v-if="!left" disabled>
        <template v-slot:title>
          <div class="side">B</div>
        </template>
      </b-tab>
    </b-tabs>
    <!-- intersection -->
    <div class="row justify-content-between" v-if="containsComparison">
      <div class="col-auto w-100">
        <b-tabs pills content-class="mt-3" align="center">
          <b-tab v-for="(option, i) in comparisonOptions" :key="i">
            <template v-slot:title>
              <div v-html="$t(`comparison.labels.${option}`)" />
            </template>
          </b-tab>
          <section class="px-1">
            <h3 class="textbox-fancy" v-if="!isNaN(this.total)" v-html="$tc(`comparison.titles.${comparable.type}`, this.total, {
              n: $n(this.total),
            })"/>
            <h3 v-else> "..."</h3>
            <div  v-html="$t(`comparison.descriptions.${comparable.type}`)"/>
          </section>
        </b-tabs>
      </div>
      <!-- <div class="col-auto align-self-start">
        <div v-if="comparable.type" class="badge badge-secondary type d-flex">
          <span class="small-caps d-flex">{{comparable.type}}</span>
        </div>
      </div> -->
    </div>

  </div>
  <div class="search-button-wrapper">
    <router-link v-if="comparable && searchPageLink(comparable) !== undefined"
                 class="btn btn-outline-primary btn-sm"
                 :to="searchPageLink(comparable)">
      {{
        $t('actions.searchMore')
      }}
      {{
        $tc('numbers.resultsParenthesis', total, {
          n: $n(total),
        })
      }}
    </router-link>
  </div>
  </div>
  </div>
</template>

<script>
// import { mapState } from 'vuex'
import SearchQuery from '@/models/SearchQuery';
import SearchPills from '../../SearchPills';
import Autocomplete from '../../Autocomplete';
import CollectionPicker from '../../base/CollectionPicker';

export default {
  data: () => ({
    lastQuery: undefined,
    lastQueryHash: undefined,
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
    left: {
      type: Boolean,
    },
    total: Number, // total items in selected collection.
    collections: {
      type: Array, // An array of `{ title, id }` objects for the dropdown box
      default() { return []; },
    },
    comparisonOptions: {
      type: Array,
      default() {
        return ['intersection', 'diffA', 'diffB'];
      },
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
    SearchPills,
    Autocomplete,
    CollectionPicker,
  },
  watch: {
    'comparable.query': {
      handler() {
        const { comparableId: searchQueryId, comparable: { query = { filters: [] } } } = this;
        const { filters } = query;
        if (this.comparable.query) {
          // get current query hash
          const hash = SearchQuery.serialize({ filters }, 'protobuf');
          if (this.lastQueryHash !== hash) {
            // emit comparable-changed
            this.$emit('comparable-changed', this.comparable);
          }
          this.lastQueryHash = hash;
          this.$set(this, 'lastQuery', this.comparable.query);
        }
        // check here that lastQuery is different that the new one.
        this.$store.dispatch('queryComparison/SET_SEARCH_QUERY_FILTERS', { searchQueryId, filters });
      },
      immediate: true,
      deep: true,
    }
  },
  mounted() {
    this.$eventBus.$on(this.$eventBus.ADD_FILTER_TO_SEARCH_QUERY, ({ filter, searchQueryId }) => {
      if (this.comparableId === searchQueryId) {
        this.onSuggestion(filter);
      }
    });
  },
  methods: {
    handleFiltersChanged(filters) {
      const { comparableId: searchQueryId } = this;
      this.$store.dispatch('queryComparison/SET_SEARCH_QUERY_FILTERS', { searchQueryId, filters });
      this.comparable.query = this.canonicalSearchQuery;
    },
    onCollectionSelected(id) {
      const comparable = Object.assign({}, this.comparable, { id });
      this.$emit('comparable-changed', comparable);
    },
    getTabLabel(type) {
      if (type === this.comparable.type) {
        return this.$tc(`tabs.${type}.active`, this.total, {
          count: this.$n(this.total),
        });
      }
      return this.$t(`tabs.${type}.pick`);
    },
    typeChanged(newType) {
      this.comparable.type = newType;
      if (newType === 'query' && !this.comparable.query && this.lastQuery) {
        this.comparable.query = this.lastQuery;
      }
    },
    onSuggestion(filter) {
      const { comparableId: searchQueryId } = this;
      this.$store.dispatch('queryComparison/ADD_FILTER', { searchQueryId, filter });
      this.comparable.query = this.canonicalSearchQuery;
    },
    onRemoveFilter(filter) {
      const { comparableId: searchQueryId } = this;
      this.$store.dispatch('queryComparison/REMOVE_FILTER', { searchQueryId, filter });
      this.comparable.query = this.canonicalSearchQuery;
    },
    onAddFilter(filter) {
      this.onSuggestion(filter);
    },
    onUpdateFilter() {
      this.comparable.query = this.canonicalSearchQuery;
    },
    searchPageLink(c) {
      if (c.type === 'query') {
        if (c.query === undefined) return undefined;
        return {
          name: 'search',
          query: SearchQuery.serialize({
            filters: c.query.filters,
          }),
        };
      }
      if (c.type === 'intersection') {
        if (c.filters === undefined) return undefined;
        return {
          name: 'search',
          query: SearchQuery.serialize({
            filters: c.filters,
          }),
        };
      }
      if (c.id === undefined) return undefined;
      return {
        name: 'search',
        query: SearchQuery.serialize({
          filters: [{ type: 'collection', q: c.id }],
        }),
      };
    },
  },
  computed: {
    alignment() {
      if (this.comparable.type === 'intersection') {
        return 'center';
      }
      return this.left ? 'left' : 'right';
    },
    containsComparison() {
      return this.comparisonOptions.includes(this.comparable.type);
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
  $left-panel-color: #2e80c9;
  $right-panel-color: #FC5C53;
  $middle-panel-color: #2d2e41; // multiply A + B
  // $middle-panel-color: #fdafdb;// dodge A B

  .query-header-panel{
    position: relative;
    width: 100%;
    height: 100%;
    margin-bottom: 2rem;
    .type {
      .small-caps {
        height: 17px;
        vertical-align: top;
      }
    }
    .inner{
      position: relative;
      margin-bottom: 2rem;
      height: 100%;
    }
    &>.left {
      margin-right: 1px;
      border-bottom: 1px solid $left-panel-color;
      ul.nav.nav-pills{
        border-bottom-color: $left-panel-color;
        .nav-item .nav-link.active{
          color: $left-panel-color;
          border-top-color: $left-panel-color;
          border-left-color: $left-panel-color;
          border-right-color: $left-panel-color;
        }
      }
      .viz-bar{
        background-color: $left-panel-color;
      }
    }

    &>.right {
      margin-left: 1px;
      border-bottom: 1px solid $right-panel-color;
      ul.nav.nav-pills{
        border-bottom-color: $right-panel-color;
        .nav-item .nav-link.active{
          color: $right-panel-color;
          border-top-color: $right-panel-color;
          border-left-color: $right-panel-color;
          border-right-color: $right-panel-color;
        }
      }
    }

    &>.middle {
      border: 1px solid $middle-panel-color;
      border-bottom-width: 2px;
      ul.nav.nav-pills{
        border-bottom-color: $middle-panel-color;
        .nav-item .nav-link.active{
          color: $middle-panel-color;
          border-top-color: $middle-panel-color;
          border-left-color: $middle-panel-color;
          border-right-color: $middle-panel-color;
        }
      }
    }

    span.number {
      font-weight: bold;
    }

    div.side {
      color: #FC5C53;
      text-transform: lowercase;
      width: 1.25em;
      height: 1.25em;
      line-height: 1em;
      text-align: center;
      border-radius: 1.25em;
      border: 1px solid;

      &.left{
        color: #2E80C9;
      }
    }
    div.search-button-wrapper{
      position: absolute;
      bottom: 0.5rem;
      text-align: center;
      width: 100%;
    }
  }
</style>

<i18n>
{
  "en": {
    "comparison": {
      "labels": {
        "intersection": "<div class='side left d-inline-block'>A</div> &amp; <div class='side d-inline-block'>B</div>",
        "diffA": "<div class='side left d-inline-block'>A</div> not in <div class='side d-inline-block'>B</div>",
        "diffB": "<div class='side d-inline-block'>B</div> not in <div class='side left d-inline-block'>A</div>"
      },
      "titles": {
        "intersection": "no results in common | Only 1 result in common | <span class='number'>{n}</span> results in common"
      },
      "descriptions": {
        "intersection": "Lists of newspapers, named entities and topics for articles which appear both in A and B."
      }
    },
    "tabs": {
      "collection": {
        "active": "collection *",
        "pick": "collection"
      },
      "query": {
        "active": "query *",
        "pick": "query"
      }
    }
  }
}
</i18n>
