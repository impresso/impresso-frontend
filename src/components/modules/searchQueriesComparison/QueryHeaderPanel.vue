<template lang="html">
  <div class="query-header-panel">
  <div class="p-2 container">
    <b-tabs pills content-class="mt-3" :align="alignment"
            v-if="comparable.type !== 'intersection'">
      <!-- query -->
      <b-tab v-if="left" disabled>
        <template v-slot:title>
          <div class="side left" :style="{ color: colors.left }">A</div>
        </template>
      </b-tab>
      <b-tab
             :active="comparable.type === 'query'"
             :title="getTabLabel('query')">
        <div class="px-1 pb-2">
          <search-pills enable-add-filter
                        :filters="filters"
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
          <div class="side" :style="{ color: colors.right }">B</div>
        </template>
      </b-tab>
    </b-tabs>
    <!-- intersection -->
    <div class="row justify-content-between" v-if="containsComparison">
      <div class="col-auto w-100">
        <b-tabs pills content-class="mt-3" align="center">
          <b-tab v-for="(option, i) in comparisonOptions" :key="i">
            <template v-slot:title>
              <div v-html="$t(`comparison.labels.${option}`, colors)"></div>
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
</template>

<script>
import SearchQueryModel from '@/models/SearchQuery';
import SearchPills from '../../SearchPills';
import Autocomplete from '../../Autocomplete';
import CollectionPicker from '../../base/CollectionPicker';
import { ComparableTypes, comparableToQuery } from '@/logic/queryComparison'

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').SearchQuery} SearchQuery
 * @typedef {import('@/logic/queryComparison').Comparable} Comparable
 */
export default {
  data: () => ({
    lastQuery: undefined,
    lastQueryHash: undefined,
  }),
  props: {
    /** @type {import('vue').PropOptions<Comparable>} */
    comparable: {
      type: Object,
      required: true
    },
    title: {
      type: String,
    },
    left: {
      type: Boolean,
    },
    total: Number, // total items in selected collection.
    /**
     * list of available collections
     * @type {import('vue').PropOptions<{ title: string, id: string }[]>}
     */
    collections: {
      type: Array,
      default() { return []; },
    },
    /**
     * @type {import('vue').PropOptions<string[]>}
     */
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
    /** @type {import('vue').PropOptions<{ left: string, right: string }>} */
    colors: {
      type: Object,
      required: true
    }
  },
  components: {
    SearchPills,
    Autocomplete,
    CollectionPicker,
  },
  methods: {
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      const comparable = {
        ...this.comparable,
        query: { filters },
        type: ComparableTypes.Query,
        id: undefined
      }
      this.$emit('comparable-changed', comparable);
    },
    /** @param {string} id */
    onCollectionSelected(id) {
      const comparable = {
        ...this.comparable,
        type: ComparableTypes.Collection,
        id,
        query: undefined
      }
      this.$emit('comparable-changed', comparable);
    },
    /** @param {string} type */
    getTabLabel(type) {
      if (type === this.comparable.type) {
        return this.$tc(`tabs.${type}.active`, this.total, {
          count: this.$n(this.total),
        });
      }
      return this.$t(`tabs.${type}.pick`);
    },
    /** @param {Filter} filter */
    onSuggestion(filter) {
      const filters = this.comparable?.query?.filters ?? []
      const comparable = {
        ...this.comparable,
        query: { filters: filters.concat(filter) },
        type: 'query',
        id: undefined
      }
      this.$emit('comparable-changed', comparable);
    },
    /** @param {Comparable} c */
    searchPageLink(comparable) {
      const searchQuery = comparableToQuery(comparable)
      if (searchQuery == null) return searchQuery

      return {
        name: 'search',
        query: SearchQueryModel.serialize(searchQuery)
      }
    },
  },
  computed: {
    /** @returns {string} */
    alignment() {
      if (this.comparable.type === 'intersection') {
        return 'center';
      }
      return this.left ? 'left' : 'right';
    },
    /** @returns {boolean} */
    containsComparison() {
      return this.comparisonOptions.includes(this.comparable.type);
    },
    /** @returns {Filter[]} */
    filters() {
      return this.comparable?.query?.filters ?? []
    },
  },
};
</script>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";
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

    span.number {
      font-weight: bold;
    }

    div.side {
      text-transform: lowercase;
      width: 1.25em;
      height: 1.25em;
      line-height: 1em;
      text-align: center;
      border-radius: 1.25em;
      border: 1px solid;
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
        "intersection": "<div class='side left d-inline-block' style='color: {left};'>A</div> &amp; <div class='side d-inline-block' style='color: {right};'>B</div>",
        "diffA": "<div class='side left d-inline-block' style='color: {left};'>A</div> not in <div class='side d-inline-block' style='color: {right};'>B</div>",
        "diffB": "<div class='side d-inline-block' style='color: {right};'>B</div> not in <div class='side left d-inline-block' style='color: {left};'>A</div>"
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
