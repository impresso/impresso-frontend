<template lang="html">
  <div class="filter-monitor">
    <div v-if="checkbox">
      <!--  context -->
      <b-form-group>
        <b-form-radio-group
          switches
          v-model="currentContext"
          v-bind:options="checkboxContexts">
        </b-form-radio-group>
      </b-form-group>
      <!--  operator -->
      <b-form-group v-if="currentContext === 'include' && availableItems.length > 1">
        <b-form-radio-group
          switches
          v-model="editedFilter.op"
          v-bind:options="checkboxOperators">
        </b-form-radio-group>
      </b-form-group>
    </div>

    <div v-else>
      <!--  context -->
      <b-dropdown size="sm" variant="outline-primary" class="mr-1">
        <template slot="button-content">
          <span v-html="$t(`label.${type}.context.${currentContext}`)"/>
        </template>
        <b-dropdown-item
          v-for="option in contexts"
          v-bind:active="currentContext === option"
          v-bind:key="option"
          v-on:click="currentContext = option"
        ><span class="small" v-html="$t(`label.${type}.context.${option}`)"></span></b-dropdown-item>
      </b-dropdown>
      <!--  operator -->
      <b-dropdown v-if="operators.length > 1" size="sm" variant="outline-primary">
        <template slot="button-content">
          <span v-html="$t(`op.${editedFilter.op}.${currentContext}`)"/>
        </template>
        <b-dropdown-item
          v-for="option in operators"
          v-bind:active="editedFilter.op === option"
          v-bind:key="option"
          v-on:click="editedFilter.op = option"
        ><span class="small" v-html="$t(`op.${option}.${currentContext}`)"></span></b-dropdown-item>
      </b-dropdown>
    </div>
    <!-- for strings -->
    <div v-if="['string', 'title'].indexOf(type) !== -1">
      <b-form-group :label="$t(`label.${type}.value`)">
        <b-form-input
          size="sm"
          placeholder=""
          v-model="editedFilter.q">
        </b-form-input>
      </b-form-group>

      <div class="mb-3">
        <b-button
          size="sm" variant="outline-primary" class="border bg-light w-100"
          v-on:click="showEmbeddings = !showEmbeddings;"
          v-bind:class="{ 'border-bottom-0': showEmbeddings }">
          {{$t('embeddings.find')}}
        </b-button>
        <embeddings-search v-if="showEmbeddings"
                           v-bind:filter="editedFilter"
                           @embdding-selected="addEmbeddingSuggestion"/>
      </div>

      <!--  context -->
      <b-form-group v-if="checkbox">
        <b-form-radio-group
          switches
          :options="checkboxPrecisions"
          v-model="editedFilter.precision">
        </b-form-radio-group>
      </b-form-group>
    </div>
    <div v-for="(item, idx) in filter.items" :key="idx" class="mt-2">
      <div v-if="RangeFacets.includes(type)">
        <filter-number-range v-if="NumericRangeFacets.includes(type)" :start="parseInt(item.start, 10)" :end="parseInt(item.end, 10)" @changed="handleRangeChanged"/>
        <filter-daterange v-else :start="new Date(item.start)" :end="new Date(item.end)" @changed="handleRangeChanged"/>
      </div>
      <b-form-checkbox v-else v-model="checkedItems[item.uid]" @change="toggleFilterItem($event, item.uid)">
        <item-label :item="item" :type="type"/>
        <span v-if="!item.uid">...</span>
        <span v-if="item.count">(<span v-html="$tc('numbers.results', item.count, { n: $n(item.count) })"/>)</span>
        <item-selector :uid="item.uid" :item="item" :type="type"/>
      </b-form-checkbox>
    </div>
    <div class="items-to-add" v-if="itemsToAdd.length">
      <div v-for="(item, idx) in itemsToAdd" :key="idx">
        <span v-if="type === 'topic'" v-html="item.htmlExcerpt"></span>
        <span v-if="['person', 'location', 'newspaper'].indexOf(type) !== -1">{{ item.name }}</span>
        <span v-if="['language', 'country'].indexOf(type) !== -1">{{ $t(`buckets.${type}.${item.uid}`) }}</span>
        <collection-item v-if="type === 'collection'" :item="item" />
        <span v-if="item.count">(<span v-html="$tc('numbers.results', item.count, { n: $n(item.count) })"/>)</span>
      </div>
    </div>

    <b-button
      class="mt-2"
      v-if="hasChanges"
      block
      size="sm"
      variant="outline-primary"
      @click="applyChanges()">
      <span v-if="itemsToAdd.length > 0 || excludedItemsIds.length > 0">
        {{
          $t('actions.applyChangesDetailed', {
            added: itemsToAdd.length,
            removed: excludedItemsIds.length
          })
        }}
      </span>
      <span v-else>{{ $t(`actions.applyChanges`)}}</span>
    </b-button>
  </div>
</template>

<script>
import FilterDaterange from './FilterDateRange';
import FilterNumberRange from './FilterNumberRange';
import ItemSelector from './ItemSelector';
import ItemLabel from './lists/ItemLabel';
import CollectionItem from './lists/CollectionItem';
import EmbeddingsSearch from './EmbeddingsSearch';
import {
  toCanonicalFilter,
  toSerializedFilter,
  RangeFacets,
  NumericRangeFacets
} from '../../logic/filters'

/**
 * Changes filter after 'apply' button is clicked.
 * Use with `v-model`.
 */
export default {
  model: {
    prop: 'filter',
    event: 'changed'
  },
  data: () => ({
    showEmbeddings: false,
    editedFilter: {},
    excludedItemsIds: [],
    RangeFacets,
    NumericRangeFacets
  }),
  props: {
    operators: {
      type: Array,
      default: () => ['OR'],
    },
    contexts: {
      type: Array,
      default: () => ['include', 'exclude'],
    },
    precisions: {
      type: Array,
      default: () => ['fuzzy', 'exact', 'soft'],
    },
    /* Render context, operators as checkboxes */
    checkbox: {
      type: Boolean,
      default: false,
    },
    /** @type {import('vue').PropType<import('../../models/models').Filter>} */
    filter: Object,
    /* filter items to be added to the filter when confirm button is clicked */
    itemsToAdd: {
      /** @type {import('vue').PropType<Array<import('../../models/models').Entity>>} */
      type: Array,
      default: () => [],
    },
  },
  computed: {
    checkedItems() {
      return this.availableItems.reduce((acc, item) => {
        acc[item.uid] = !this.excludedItemsIds.includes(item.uid)
        return acc
      }, {})
    },
    availableItems() {
      const filterItems = this.filter.items || []
      return filterItems.concat(this.itemsToAdd)
    },
    type() { return this.filter.type || '' },
    checkboxPrecisions() {
      return this.precisions.map(value => ({
        text: this.$t(`label.${this.type}.precision.${value}`),
        value,
      }));
    },
    checkboxContexts() {
      return this.contexts.map(value => ({
        text: this.$t(`label.${this.type}.context.${value}`),
        value,
      }));
    },
    checkboxOperators() {
      return this.operators.map(value => ({
        text: this.$t(`op.${value}.${this.currentContext}`),
        value,
      }));
    },
    hasChanges() {
      return this.itemsToAdd.length > 0
        || this.excludedItemsIds.length > 0
        || toSerializedFilter(this.filter) !== toSerializedFilter(this.editedFilter)
    },
    currentContext: {
      get() {
        return this.editedFilter.context
          ? this.editedFilter.context
          : 'include'
      },
      set(value) { this.editedFilter.context = value }
    }
  },
  methods: {
    applyChanges() {
      if (Array.isArray(this.editedFilter.q) && !RangeFacets.includes(this.editedFilter.type)) {
        const allItemsDictonary = this.filter.items.concat(this.itemsToAdd).reduce((acc, item) => {
          acc[item.uid] = item
          return acc
        }, {})
        const availableItemsIds = [...new Set(this.filter.items.concat(this.itemsToAdd).map(({ uid }) => uid))]
        const selectedItemsIds = availableItemsIds.filter(id => !this.excludedItemsIds.includes(id))
        const selectedItems = selectedItemsIds.map(id => allItemsDictonary[id])
        this.$emit('changed', {
          ...this.editedFilter,
          items: selectedItems,
          q: selectedItemsIds
        })
      } else {
        this.$emit('changed', this.editedFilter)
      }
    },
    toggleFilterItem(selected, uid) {
      if (selected) {
        this.excludedItemsIds = this.excludedItemsIds.filter(id => id !== uid)
      } else {
        this.excludedItemsIds = this.excludedItemsIds.concat(uid)
      }
    },
    addEmbeddingSuggestion(embedding) {
      this.editedFilter.q = `${this.editedFilter.q} ${embedding}`
      this.editedFilter.precisions = 'soft'
    },
    handleRangeChanged({ item, q }) {
      this.editedFilter.q = q
      this.editedFilter.items = [item]
    }
  },
  components: {
    FilterDaterange,
    CollectionItem,
    EmbeddingsSearch,
    ItemLabel,
    ItemSelector,
    FilterNumberRange
  },
  watch: {
    /**
     * When filter changes, make a copy in `editedFilter`.
     * This is the filter we will be changing until the `apply` button is clicked.
     */
    filter: {
      handler() {
        if (toSerializedFilter(this.editedFilter) === toSerializedFilter(this.filter)) return

        this.editedFilter = toCanonicalFilter(this.filter)
        if (this.itemsToAdd) {
          this.editedFilter.q = this.editedFilter.q.concat(this.itemsToAdd.map(({ uid }) => uid))
        }
        this.excludedItemsIds = []
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

<style lang="scss">
.items-to-add {
  background: yellow;
}
label.custom-control-label {
  font-variant: none;
}
</style>
<i18n>
{
  "en": {
    "embeddings": {
      "find": "Find Similar Words"
    },
    "op": {
      "OR": {
        "include": "at least <b>one</b> of the following",
        "exclude": "<b>any</b> of the following"
      },
      "AND": {
        "include": "<b>all</b> of the following",
        "exclude": "<b>all</b> of the following"
      }
    },
    "label": {
      "title": {
        "context": {
          "include": "Contains",
          "exclude": "<b>NOT</b> contains"
        },
        "precision": {
          "exact": "exactly all words",
          "fuzzy": "fuzzy match",
          "soft": "at least one of the words"
        },
        "value": "value",
        "apply": "apply changes"
      },
      "country": {
        "title": "Filter by country of publication",
        "context": {
          "include": "newspapers published in",
          "exclude": "newspapers <b>NOT</b> published in"
        }
      },
      "string": {
        "title": "article text",
        "context": {
          "include": "Contains",
          "exclude": "<b>NOT</b> contains"
        },
        "precision": {
          "exact": "exactly all words",
          "fuzzy": "fuzzy match",
          "soft": "at least one of the words"
        },
        "value": "value",
        "apply": "apply changes"
      },
      "topic": {
        "title": "filter by topic",
        "selected": "filter results if <b>one of {count} selected</b> topic applies",
        "filtered": "filter results if <b>one of {count} selected</b> topic applies",
        "description": "check one or more topics to filter results",
        "update": "apply changes (added: {added}, removed: {removed})",
        "clear": "reset",
        "apply": "apply changes",
        "context": {
          "include": "Containing",
          "exclude": "<b>NOT</b> containing"
        }
      },
      "person": {
        "context": {
          "include": "Mentioning",
          "exclude": "<b>NOT</b> mentioning"
        }
      },
      "location": {
        "context": {
          "include": "Mentioning",
          "exclude": "<b>NOT</b> mentioning"
        }
      },
      "collection": {
        "title": "filter by collection",
        "selected": "filter results if they appear in <b>one of {count} selected</b> newspapers",
        "description": "check one or more newspaper to filter results",
        "clear": "reset",
        "apply": "apply changes",
        "update": "apply changes (added: {added}, removed: {removed})",
        "context": {
          "include": "Saved in",
          "exclude": "<b>NOT</b> saved in"
        }
      },
      "newspaper": {
        "title": "filter by newspaper titles",
        "selected": "filter results if they appear in <b>one of {count} selected</b> newspapers",
        "description": "check one or more newspaper to filter results",
        "clear": "reset",
        "apply": "apply changes",
        "update": "apply changes (added: {added}, removed: {removed})",
        "context": {
          "include": "Published in",
          "exclude": "<b>NOT</b> published in"
        }
      },
      "language": {
        "title": "filter by language of articles",
        "selected": "filter results if they are written in <b>one of {count} selected</b> languages",
        "description": "check one or more language to filter results",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "Written in",
          "exclude": "<b>NOT</b> written in"
        }
      },
      "daterange": {
        "title": "filter by date of publication",
        "selected": "filter results if they are published between <b>one of {count} selected</b> languages",
        "description": "check one or more language to filter results",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "Published between",
          "exclude": "<b>NOT</b> published between"
        }
      },
      "textReuseClusterSize": {
        "title": "filter by text reuse cluster size",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "cluster size between",
          "exclude": "cluster size <b>NOT</b> between"
        }
      },
      "textReuseClusterLexicalOverlap": {
        "title": "filter by text reuse cluster lexical overlap",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "lexical overlap between",
          "exclude": "lexical overlap <b>NOT</b> between"
        }
      },
      "textReuseClusterDayDelta": {
        "title": "filter by text reuse cluster time span (days)",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "time span between",
          "exclude": "time span <b>NOT</b> between"
        }
      }
    }
  },
  "nl": {
    "label": {
      "newspaper": "Krant",
      "language": "Taal"
    }
  }
}
</i18n>
