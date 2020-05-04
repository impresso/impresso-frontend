<template>
  <div class='search-pills'>
    <b-dropdown size="sm" variant="outline-primary" class="mr-1 mb-1 search-pill"
      v-for="({ filter, filterIndex }) in pills" :key="filterIndex">
      <!--  button content -->
      <template slot="button-content">
        <!-- badge: initial type instead of icons -->
        <span
          class="filter-icon"
          :class="[
            {'dripicons-align-justify': filter.type === 'string'},
            {'dripicons-minus': filter.type === 'title'},
            {'dripicons-message': filter.type === 'topic'},
            {'dripicons-user': filter.type === 'person'},
            {'dripicons-location': filter.type === 'location'},
            {'dripicons-pamphlet': filter.type === 'newspaper'},
            {'dripicons-web': filter.type === 'language'},
            {'dripicons-pulse': filter.type === 'daterange'},
            {'dripicons-calendar': filter.type === 'year'},
            {'dripicons-suitcase': filter.type === 'collection'},
            {'dripicons-tag': filter.type === 'type'},
            {'dripicons-print': filter.type === 'country'},
            {'dripicons-shopping-bag': filter.type === 'accessRight'},
            {'dripicons-store': filter.type === 'partner'},
            {'dripicons-scale': numericTypes.includes(filter.type)},

          ]" />
        <!--  type:string, type:title -->
        <span class="label sp-string sp-title"
          v-if="['string', 'title'].includes(filter.type)"
          v-html="labelByItems({ items: filter.items, max: 2, prop: 'uid', op: filter.op })"
          :class="[filter.context, filter.precision]"
          >
        </span>
        <!--  type:topic -->
        <span class="label sp-topic"
          v-if="filter.type === 'topic'"
          v-html="labelByItems({ items: filter.items, max: 2, prop: 'htmlExcerpt', op: filter.op })"
          :class="filter.context">
        </span>
        <!--  type:person, type:location, type:newspaper -->
        <span class="label sp-labelled"
          v-if="['person', 'location', 'newspaper'].indexOf(filter.type) !== -1"
          v-html="labelByItems({ items: filter.items, max: 2, op: filter.op })"
          :class="filter.context">
        </span>
        <!--  type:language and other items -->
        <span class="label sp-generic-item"
          v-if="['language', 'country', 'type', 'accessRight', 'partner'].indexOf(filter.type) !== -1"
          v-html="labelByItems({ items: filter.items, max: 2, prop:'uid', translate: true, type:filter.type, op: filter.op })"
          :class="filter.context">
        </span>
        <!--  type:generic -->
        <span class="label sp-generic-item"
          v-if="['year'].includes(filter.type)"
          :class="filter.context">{{filter}}{{ filter.q && Array.isArray(filter.q) ? filter.q.join(', ') : '' }}
        </span>
        <!--  type:collections -->
        <span class="label sp-collection"
          v-if="filter.type === 'collection'"
          v-html="labelByItems({ items: filter.items, max: 2, op: filter.op })"
          :class="filter.context">
        </span>

        <!--  type: (with slider) -->
        <span class="label sp-collection"
          v-if="numericTypes.includes(filter.type)"
          v-html="labelForNumeric({ items: filter.items, type: filter.type })"
          :class="filter.context">
        </span>

        <!--  type:daterange -->
        <span class="label sp-daterange"
          v-if="filter.type === 'daterange'"
          :class="filter.context" v-html="labelByDaterangeItems({ items: filter.items, max: 2 })">
        </span>
      </template>

      <div class="p-2 pb-1 sp-contents">
        <div class="description">{{ $tc(`label.${filter.type}.title`, filter.items ? filter.items.length : 0) }}</div>
        <filter-monitor checkbox
                        :filter="filter"
                        @changed="updatedFilter => handleFilterUpdated(filterIndex, updatedFilter)"
                        :operators="['AND', 'OR']" />
      </div>

      <!-- type is not string, add Remove button -->
      <div class="px-2 mt-1 mb-2">
        <b-button block size="sm" variant="outline-primary" @click="handleFilterRemoved(filterIndex)">{{$t('actions.remove')}}</b-button>
      </div>
    </b-dropdown>
    <b-button v-if="enableAddFilter" class="mb-1" variant="outline-primary" size="sm" v-on:click="showFilterExplorer">{{ $t('actions.addFilter') }}</b-button>

    <explorer v-model="explorerFilters"
      :is-visible="explorerVisible"
      @onHide="handleExplorerHide"
      :searching-enabled="false"
      :included-types="includedFilterTypes"
      :index="index"/>
  </div>
</template>

<script>
import FilterMonitor from '@/components/modules/FilterMonitor';
import Explorer from '@/components/Explorer';
import { NumericRangeFacets, RangeFacets } from '@/logic/filters'
import FilterFactory from '@/models/FilterFactory'

/**
 * @typedef {import('@/models').Filter} Filter
 */

/**
 * Use `v-model`.
 */
export default {
  model: {
    prop: 'filters',
    event: 'changed'
  },
  data: () => ({
    explorerVisible: false
  }),
  props: {
    /** @type {import('vue').PropOptions<string[]>} */
    excludedTypes: {
      type: Array,
      default: () => ['hasTextContents', 'isFront'],
    },
    /** @type {import('vue').PropOptions<string[] | undefined>} */
    includedFilterTypes: {
      /* included filter types override excluded types */
      type: Array,
      default: undefined
    },
    /** @type {import('vue').PropOptions<boolean>} */
    enableAddFilter: {
      type: Boolean,
      default: false,
    },
    /** @type {import('vue').PropOptions<Filter[]>} */
    filters: {
      type: Array,
      default: () => []
    },
    /** @type {import('vue').PropOptions<string>} */
    index: {
      type: String,
      default: 'search'
    }
  },
  computed: {
    /** @returns {{filter: Filter, filterIndex: number}[]} */
    pills() {
      /* included filter types override excluded types */
      const filterFn = this.includedFilterTypes != null
        ? (/** @type {{filter: Filter}} */ { filter: { type } }) => (this.includedFilterTypes || []).includes(type)
        : (/** @type {{filter: Filter}} */ { filter: { type } }) => !this.excludedTypes.includes(type)
      return this.filters
        .map((filter, filterIndex) => ({ filter: FilterFactory.create(filter), filterIndex }))
        .filter(filterFn)
    },
    explorerFilters: {
      /** @returns {Filter[]} */
      get() { return this.filters },
      /** @param {Filter[]} filters */
      set(filters) { this.$emit('changed', filters) }
    },
    /** @returns {string[]} */
    numericTypes() { return NumericRangeFacets }
  },
  methods: {
    /**
     * @param {number} index
     * @param {Filter} filter
     */
    handleFilterUpdated(index, filter) {
      // If this filter has no items selected - remove the filter
      if (!RangeFacets.includes(filter.type) && Array.isArray(filter.q) && filter.q.length === 0) {
        return this.handleFilterRemoved(index)
      }

      const newFilters = [...this.filters]
      newFilters[index] = filter
      this.$emit('changed', newFilters)
    },
    /**
     * @param {number} index
     */
    handleFilterRemoved(index) {
      const newFilters = this.filters.filter((f, idx) => idx !== index)
      this.$emit('changed', newFilters)
    },
    /**
     * @param {object} p
     */
    labelByItems({
      items = [],
      prop = 'name',
      max = 1,
      op = 'OR',
      translate = false,
      type = 'label',
    } = {}) {
      let labels = items.slice(0, max)
        .map((/** @type {object} */ d) => {
          if (translate) {
            return this.$t(`buckets.${type}.${d[prop]}`);
          }
          return d[prop] || '...';
        }).join(`<span class="op or px-1">${this.$t(`op.${op.toLowerCase()}`)}</span>`);
      if (items.slice(max).length) {
        labels += this.$t('items.hidden', {
          count: items.slice(max).length,
        });
      }

      return labels;
    },
    /**
     * @param {object} p
     */
    labelByDaterangeItems({
      items = [],
      max = 1,
    } = {}) {
      let labels = items.slice(0, max).map((/** @type {object} */ d) => this.$t('label.daterange.item', {
        start: this.$d(new Date(d.start), 'compactUtc'),
        end: this.$d(new Date(d.end), 'compactUtc'),
      })).join(`<span class="op or px-1">${this.$t('op.or')}</span>`);
      if (items.slice(max).length) {
        labels += this.$t('items.hidden', {
          count: items.slice(max).length,
        });
      }
      return labels;
    },
    /**
     * @param {object} p
     */
    labelForNumeric({ items = [], type }) {
      const { start, end } = items[0] || {}
      const label = this.$t(`label.${type}.item`)

      return this.$t('label.range.item', {
        label,
        start: this.$n(start),
        end: this.$n(end)
      })
    },
    /** @returns {void} */
    showFilterExplorer() {
      this.explorerVisible = true
    },
    /** @returns {void} */
    handleExplorerHide() {
      this.explorerVisible = false
    }
  },
  components: {
    FilterMonitor,
    Explorer
  }
};
</script>

<style lang="scss">


.search-pill{
  position: relative;

  span.label{
    font-variant: normal;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-flex;

    &.sp-string, &>.sp-string{
      background-color: #FFEB78;
    }
    &.sp-string.exact::before,
    &.sp-string.exact::after,
    &>.sp-string.exact::before,
    &>.sp-string.exact::after{
      content: '"';
      font-weight: bold;
    }
    &.sp-string.fuzzy::after,
    &>.sp-string.fuzzy::after{
      content: '~';
      font-weight: bold;
    }
    &.sp-string.soft::before,
    &>.sp-string.soft::before {
      content: '[';
      font-weight: bold;
    }
    &.sp-string.soft::after,
    &>.sp-string.soft::after{
      content: ']';
      font-weight: bold;
    }
  }

  span.label.exclude{
    text-decoration: line-through;

  }

  button.dropdown-toggle{
    padding-left: 0.15em;
    .filter-icon {
      font-size: 1em;
      float: left;
      width: 1.6em;
      height: 1.6em;
      padding-top: 0.2em;
      margin-right: 0.2em;
      opacity: 0.8;
      // background: red;
    }
    .filter-remove {
      float: right;
      padding-right: 0;
      margin-right: -0.5em;
      &:hover {
        color: rgba(200,0,0,0.9);
      }
    }
  }

}
.sp-contents {
  width: 300px;
}

.sp-contents ul{
  margin: 0;
  padding:0;
}
.sp-contents ul > li {
  margin: 0;
  list-style: none;
  background: #f0f0f0;
}
.op.or{
  font-variant: small-caps;
  font-weight: bold;
}
</style>
<i18n>
  {
    "en": {
      "label": {
        "string": {
          "title": "article text"
        },
        "title": {
          "title": "title"
        },
        "country": {
          "title": "Country of publication"
        },
        "topic": {
          "title": "filter by topic"
        },
        "person": {
          "title": "filter by person mentioned (experimental)"
        },
        "location": {
          "title": "filter by location (experimental)"
        },
        "collection": {
          "title": "filter by collection"
        },
        "newspaper": {
          "title": "filter by newspaper"
        },
        "daterange": {
          "title": "filter by date of publication",
          "item": "From {start} to {end}"
        },
        "range": {
          "title": "filter by {label}",
          "item": "{label} between {start} and {end}"
        },
        "textReuseClusterSize": {
          "title": "filter by text reuse cluster size",
          "item": "Cluster size"
        },
        "textReuseClusterLexicalOverlap": {
          "title": "filter by text reuse cluster lexical overlap",
          "item": "Lexical overlap"
        },
        "textReuseClusterDayDelta": {
          "title": "filter by text reuse time span in days",
          "item": "Text reuse time span"
        }
      },
      "items": {
        "hidden": "({count} more)"
      },
      "type": {
        "string": "str",
        "newspaper": "new",
        "language": "lng",
        "topic": "top"
      },
      "language": {
        "de": "German (DE)",
        "fr": "French (FR)",
        "en": "Unclassified"
      }
    }
  }
</i18n>
