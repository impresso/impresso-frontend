<template>
  <div class="FilterMonitor filter-monitor">
    <div v-if="checkbox">
      <!--  context -->
      <b-form-group>
        <radio-group
          :modelValue="currentContext"
          @update:modelValue="currentContext = $event"
          :options="checkboxContexts"
          type="radio"
        />
      </b-form-group>
      <!--  operator -->
      <b-form-group v-if="currentContext === 'include' && availableItems.length > 1">
        <radio-group
          :modelValue="editedFilter.op"
          @update:modelValue="editedFilter.op = $event"
          :options="checkboxOperators"
          type="radio"
        />
      </b-form-group>
    </div>

    <div v-else class="d-flex flex-wrap">
      <!--  context -->
      <b-dropdown size="sm" variant="outline-primary" class="mr-1">
        <template v-slot:button-content>
          <span v-html="$t(`label.${type}.context.${currentContext}`)" />
        </template>
        <b-dropdown-item
          v-for="option in contexts"
          v-bind:active="currentContext === option"
          v-bind:key="option"
          v-on:click="currentContext = option"
          ><span class="small" v-html="$t(`label.${type}.context.${option}`)"></span
        ></b-dropdown-item>
      </b-dropdown>
      <!--  operator -->
      <b-dropdown v-if="operators.length > 1" size="sm" variant="outline-primary">
        <template v-slot:button-content>
          <span v-html="$t(`op.${editedFilter.op}.${currentContext}`)" />
        </template>
        <b-dropdown-item
          v-for="option in operators"
          v-bind:active="editedFilter.op === option"
          v-bind:key="option"
          v-on:click="editedFilter.op = option"
          ><span class="small" v-html="$t(`op.${option}.${currentContext}`)"></span
        ></b-dropdown-item>
      </b-dropdown>
      <b-button
        class="dripicons-cross ms-auto ml-auto rounded p-0 no-outline"
        size="sm"
        variant="transparent"
        @click="removeFilter"
        data-testid="remove-filter-button"
      ></b-button>
    </div>
    <div class="items" :class="{ reduced: tooManyItems }">
      <div v-for="(item, idx) in filterItems" :key="idx" class="mt-2">
        <div v-if="RangeFacets.includes(type)">
          <filter-number-range
            v-if="NumericRangeFacets.includes(type)"
            :start="parseInt(item.start, 10)"
            :end="parseInt(item.end, 10)"
            @changed="handleRangeChanged"
          />
          <div v-if="type === 'daterange'">
            <FilterDateRangeCalendar
              :show-calendar="!checkbox"
              :start-date="new Date(item.start)"
              :end-date="new Date(item.end)"
              :min-date="minDate"
              :max-date="maxDate"
              @changed="handleRangeChanged"
            />
          </div>
        </div>
        <b-form-checkbox
          v-else-if="StringTypes.includes(type)"
          v-model="checkedItems[item.uid]"
          @update:modelValue="toggleFilterItem($event, item.uid)"
        >
          <b-form-input
            size="sm"
            placeholder=""
            class="accepted"
            :value="item.uid"
            @click.prevent.stop
            @update:modelValue="changeStringFilterItemAtIndex($event, idx)"
          >
          </b-form-input>
        </b-form-checkbox>
        <div v-else class="d-flex text-small">
          <b-form-checkbox
            v-model="checkedItems[item.uid]"
            @update:modelValue="toggleFilterItem($event, item.uid)"
          >
          </b-form-checkbox>
          <item-selector hide-icon :uid="item.uid" :item="item" :type="type">
            <item-label :item="item" :type="type" />
            <span v-if="!item.uid">...</span>
            <span v-if="item.count"
              >&nbsp;(<span
                v-html="
                  $tc(
                    type === 'collection'
                      ? 'numbers.articlesMatchingSearchFilters'
                      : 'numbers.results',
                    item.count,
                    { n: $n(item.count) }
                  )
                "
              />)&nbsp;</span
            >
          </item-selector>
        </div>
      </div>
      <!-- bucket items -->
      <div class="items-to-add text-small m-2" v-if="itemsToAdd.length">
        <div v-for="(item, idx) in itemsToAdd" :key="idx">
          <span v-if="type === 'topic'" v-html="item.htmlExcerpt"></span>
          <span v-if="['person', 'location', 'newspaper'].indexOf(type) !== -1">{{
            item.name
          }}</span>
          <span v-if="['language', 'country'].indexOf(type) !== -1">{{
            $t(`buckets.${type}.${item.uid}`)
          }}</span>
          <collection-item v-if="type === 'collection'" :item="item" />
          <span v-if="item.count"
            >(<span v-html="$tc('numbers.results', item.count, { n: $n(item.count) })" />)</span
          >
          <item-selector :uid="item.uid" :item="item" :type="type" />
          <b-button
            class="dripicons-cross ml-auto"
            variant="transparent"
            size="sm"
            style="padding: 0.25rem 0.5rem 0 0.5rem"
            @click.prevent.stop="removeItem(idx)"
          />
        </div>
      </div>
      <!-- string to add -->
      <div class="strings-to-add m-2 ml-4" v-if="stringsToAdd.length">
        <div v-for="(item, idx) in stringsToAdd" :key="idx" class="mb-2 d-flex">
          <b-form-input
            size="sm"
            placeholder="..."
            class="mr-1"
            v-model="item.uid"
            @click.prevent.stop
          >
          </b-form-input>
          <b-button
            class="dripicons-cross"
            variant="transparent"
            size="sm"
            style="padding: 0.25rem 0.5rem 0 0.5rem"
            @click.prevent.stop="removeStringItem(idx)"
          />
        </div>
      </div>
    </div>
    <div v-if="EntityTypes.includes(type)">
      <b-row no-gutters>
        <b-col cols="6">
          <div class="mr-1">
            <b-button
              size="sm"
              variant="outline-primary"
              block
              v-on:click.prevent="showEntitySuggester = !showEntitySuggester"
            >
              {{ $t('actions.addUsingEmbeddings') }}
            </b-button>
          </div>
        </b-col>
      </b-row>
      <entity-suggester
        v-if="showEntitySuggester"
        :filter="filter"
        :type="type"
        @filter-changed="handleFilterChanged"
        class="border p-2 bg-light"
      />
    </div>
    <!-- @entity-selected="addEmbeddingSuggestion"/> -->
    <!-- add new string as an OR filter -->
    <div class="mt-3" v-else-if="StringTypes.includes(type)">
      <b-row no-gutters>
        <b-col cols="6">
          <div class="mr-1">
            <b-button
              size="sm"
              variant="outline-primary"
              block
              @click.prevent.stop="addStringItem(type)"
              :disabled="hasEmptyStringItems"
            >
              {{ $t('actions.addItem') }}
            </b-button>
          </div>
        </b-col>
        <b-col cols="6">
          <div class="ml-1">
            <b-button
              size="sm"
              variant="outline-primary"
              block
              v-on:click.prevent="showEmbeddings = !showEmbeddings"
            >
              {{ $t('actions.addUsingEmbeddings') }}
            </b-button>
          </div>
        </b-col>
      </b-row>
      <embeddings-search
        v-if="showEmbeddings"
        :filter="editedFilter"
        @click.stop.prevent
        @embdding-selected="addEmbeddingSuggestion"
      />
    </div>
    <b-button
      class="mt-2"
      v-if="hasChanges"
      block
      size="sm"
      variant="outline-primary"
      @click="applyChanges()"
    >
      <span
        v-if="validStringsToAdd.length > 0 || itemsToAdd.length > 0 || excludedItemsIds.length > 0"
      >
        {{
          $t('actions.applyChangesDetailed', {
            added: validStringsToAdd.length || itemsToAdd.length,
            removed: excludedItemsIds.length
          })
        }}
      </span>
      <span v-else>{{ $t(`actions.applyChanges`) }}</span>
    </b-button>
  </div>
</template>

<script>
// import FilterDaterange from '@/components/modules/FilterDateRange'
import FilterDateRangeCalendar from '@/components/modules/FilterDateRangeCalendar.vue'
import FilterNumberRange from '@/components/modules/FilterNumberRange.vue'
import ItemSelector from '@/components/modules/ItemSelector.vue'
import ItemLabel from '@/components/modules/lists/ItemLabel.vue'
import CollectionItem from '@/components/modules/lists/CollectionItem.vue'
import EmbeddingsSearch from '@/components/modules/EmbeddingsSearch.vue'
import EntitySuggester from '@/components/modules/EntitySuggester.vue'
import RadioGroup from '@/components/layout/RadioGroup.vue'
import {
  toCanonicalFilter,
  toSerializedFilter,
  RangeFacets,
  NumericRangeFacets
} from '@/logic/filters'

const StringTypes = ['string', 'title']
const EntityTypes = ['person', 'location', 'entity']
/**
 * Changes filter after 'apply' button is clicked.
 * Use with `v-model`.
 */
export default {
  emits: ['changed', 'removed', 'daterange-changed'],
  data: () => ({
    showEmbeddings: false,
    showEntitySuggester: false,
    editedFilter: {},
    excludedItemsIds: [],
    stringsToAdd: [],
    RangeFacets,
    NumericRangeFacets,
    StringTypes,
    EntityTypes
  }),
  props: {
    operators: {
      type: Array,
      default: () => ['OR']
    },
    contexts: {
      type: Array,
      default: () => ['include', 'exclude']
    },
    precisions: {
      type: Array,
      default: () => ['fuzzy', 'exact', 'soft']
    },
    /* Render context, operators as checkboxes */
    checkbox: {
      type: Boolean,
      default: false
    },
    /** @type {import('vue').PropType<import('../../models/models').Filter>} */
    filter: Object,
    /* filter items to be added to the filter when confirm button is clicked */
    itemsToAdd: {
      /** @type {import('vue').PropType<Array<import('../../models/models').Entity>>} */
      type: Array,
      default: () => []
    },
    // ony required when type is daterange. This is implemented in FilterFacetDateRange component
    minDate: {
      type: Date,
      required: false,
      default: () => {
        const date = new Date(window.impressoDocumentsYearSpan.firstYear + '-01-01')
        date.setUTCHours(0, 0, 0, 0)
        return date
      }
    },
    maxDate: {
      type: Date,
      required: false,
      default: () => {
        const date = new Date(window.impressoDocumentsYearSpan.lastYear + '-12-31')
        date.setUTCHours(23, 59, 59, 0)
        return date
      }
    }
  },
  computed: {
    tooManyItems() {
      const filterItems = this.filter.items || []
      return this.stringsToAdd.length + filterItems.length + this.itemsToAdd.length > 5
    },
    hasEmptyStringItems() {
      return (
        this.stringsToAdd.length > 0 && this.stringsToAdd.filter(d => d.uid.length === 0).length > 0
      )
    },
    validStringsToAdd() {
      return this.stringsToAdd.filter(d => d.checked && d.uid.length)
    },
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
    type() {
      return this.filter.type || ''
    },
    checkboxPrecisions() {
      return this.precisions.map(value => ({
        text: this.$t(`label.${this.type}.precision.${value}`),
        value
      }))
    },
    checkboxContexts() {
      return this.contexts.map(value => ({
        text: this.$t(`label.${this.type}.context.${value}`),
        value
      }))
    },
    checkboxOperators() {
      return this.operators.map(value => ({
        text: this.$t(`op.${value}.${this.currentContext}`),
        value
      }))
    },
    serializedFilters() {
      return [
        this.hasChanges,
        this.excludedItemsIds.length,
        this.validStringsToAdd.length,
        this.itemsToAdd.length,
        toSerializedFilter(this.filter),
        toSerializedFilter(this.editedFilter),
        toSerializedFilter(this.filter) !== toSerializedFilter(this.editedFilter)
      ]
    },
    filterItems() {
      return this.filter && Array.isArray(this.filter.items) ? [...this.filter.items] : []
    },
    hasChanges() {
      return (
        this.itemsToAdd.length > 0 ||
        this.validStringsToAdd.length > 0 ||
        this.excludedItemsIds.length > 0 ||
        toSerializedFilter(this.filter) !== toSerializedFilter(this.editedFilter)
      )
    },
    currentContext: {
      get() {
        return this.editedFilter.context ? this.editedFilter.context : 'include'
      },
      set(context) {
        this.editedFilter = { ...this.editedFilter, context }
      }
    }
  },
  methods: {
    removeFilter(e) {
      e.preventDefault()
      console.info('[FilterMonitor] @removed')
      this.$emit('removed', this.filter)
    },
    applyChanges() {
      const { type } = this.editedFilter

      if (!StringTypes.includes(type) && !RangeFacets.includes(type)) {
        const allItemsDictonary = this.filter.items.concat(this.itemsToAdd).reduce((acc, item) => {
          acc[item.uid] = item
          return acc
        }, {})
        const availableItemsIds = [
          ...new Set(this.filter.items.concat(this.itemsToAdd).map(({ uid }) => uid))
        ]
        const selectedItemsIds = availableItemsIds.filter(id => !this.excludedItemsIds.includes(id))
        const selectedItems = selectedItemsIds.map(id => allItemsDictonary[id])

        this.$emit('changed', {
          ...this.editedFilter,
          items: selectedItems,
          q: selectedItemsIds
        })
      } else if (StringTypes.includes(type)) {
        const newFilter = {
          ...this.editedFilter,
          q: this.editedFilter.q
            .filter(d => !this.excludedItemsIds.includes(d))
            .concat(this.validStringsToAdd.map(d => d.uid))
        }
        this.$emit('changed', newFilter)
        this.stringsToAdd = []
      } else {
        this.$emit('changed', this.editedFilter)
      }
    },
    addStringItem() {
      this.stringsToAdd.push({
        uid: '',
        checked: true
      })
    },
    removeStringItem(idx) {
      this.stringsToAdd.splice(idx, 1)
    },
    removeItem(idx) {
      this.itemsToAdd.splice(idx, 1) // eslint-disable-line
    },
    changeStringFilterItemAtIndex(value, idx) {
      const q = this.filter.items
        .map((d, i) => {
          if (i === idx) {
            return value
          }
          return d.uid
        })
        .filter(d => d.length)
      this.editedFilter = { ...this.editedFilter, q }
    },
    toggleFilterItem(selected, uid) {
      console.info('[FilterMonitor] @toggleFilterItem', selected, uid)
      if (selected) {
        this.excludedItemsIds = this.excludedItemsIds.filter(id => id !== uid)
      } else {
        this.excludedItemsIds = this.excludedItemsIds.concat(uid)
      }
    },
    addEmbeddingSuggestion(embedding) {
      this.stringsToAdd.push({
        uid: embedding,
        checked: true
      })
      // this.editedFilter.q = `${this.editedFilter.q} ${embedding}`
      // this.editedFilter.precisions = 'soft'
    },
    handleRangeChanged({ item, q }) {
      console.info('[FilterMonitor] @handleRangeChanged', item, q)
      this.editedFilter = {
        ...this.editedFilter,
        // items: [item],
        q
      }
      if (!NumericRangeFacets.includes(this.editedFilter.type))
        this.$emit('daterange-changed', this.editedFilter)
    },
    handleFilterChanged({ items }) {
      this.itemsToAdd.splice(0, this.itemsToAdd.length, ...items) // eslint-disable-line
      // TODO:  exclude item already present
    }
  },
  components: {
    // FilterDaterange,
    FilterDateRangeCalendar,
    CollectionItem,
    EmbeddingsSearch,
    ItemLabel,
    ItemSelector,
    FilterNumberRange,
    EntitySuggester,
    RadioGroup
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
          this.editedFilter = {
            ...this.editedFilter,
            q: this.editedFilter.q.concat(this.itemsToAdd.map(({ uid }) => uid))
          }
        }
        this.excludedItemsIds = []
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style>
.FilterMonitor .items .form-control.accepted {
  color: #343a40;
}

.FilterMonitor label.custom-control-label {
  font-variant: none;
}

.FilterMonitor .reduced {
  max-height: 200px;
  overflow: scroll;
}

.FilterMonitor .no-outline:focus {
  box-shadow: none;
}
</style>
<i18n lang="json">
{
  "en": {
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
    "actions": {
      "addItem": "add new ...",
      "addUsingEmbeddings": "add similar ..."
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
        "title": "country of publication",
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
        "title": "topic",
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
      "entity": {
        "context": {
          "include": "Mentioning",
          "exclude": "<b>NOT</b> mentioning"
        }
      },
      "collection": {
        "title": "collection",
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
        "title": "newspaper titles",
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
      "partner": {
        "title": "data provider",
        "selected": "filter results if they are provided by <b>one of {count} selected</b> data providers",
        "description": "check one or more data provider to filter results",
        "clear": "reset",
        "apply": "apply changes",
        "update": "apply changes (added: {added}, removed: {removed})",
        "context": {
          "include": "Provided by",
          "exclude": "<b>NOT</b> provided by"
        }
      },
      "language": {
        "title": "language of articles",
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
        "title": "date of publication",
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
        "title": "text reuse cluster size",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "cluster size between",
          "exclude": "cluster size <b>NOT</b> between"
        }
      },
      "textReuseClusterLexicalOverlap": {
        "title": "text reuse cluster lexical overlap",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "lexical overlap between",
          "exclude": "lexical overlap <b>NOT</b> between"
        }
      },
      "textReuseClusterDayDelta": {
        "title": "text reuse cluster time span (days)",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "time span between",
          "exclude": "time span <b>NOT</b> between"
        }
      },
      "contentLength": {
        "title": "content length span",
        "apply": "apply changes",
        "clear": "reset",
        "context": {
          "include": "content length between",
          "exclude": "content length <b>NOT</b> between"
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
