<template>
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
    <div class="items" :class="{ reduced: tooManyItems }">
      <div v-for="(item, idx) in entities" :key="idx" class="mt-2">
        <div v-if="RangeFacets.includes(type)">
          <filter-number-range v-if="NumericRangeFacets.includes(type)" :start="asNumber(item.start)" :end="asNumber(item.end)" @changed="handleRangeChanged"/>
          <filter-daterange v-else :start="asDate(item.start)" :end="asDate(item.end)" @changed="handleRangeChanged"/>
        </div>
        <b-form-checkbox v-else-if="StringTypes.includes(type)" v-model="checkedItems[item.uid]" @change="toggleFilterItem($event, item.uid)">
          <b-form-input
            size="sm"
            placeholder=""
            class="accepted"
            v-model="item.uid" @click.prevent.stop @change="changeStringFilterItemAtIndex($event, idx)">
          </b-form-input>
        </b-form-checkbox>
        <b-form-checkbox v-else v-model="checkedItems[item.uid]" @change="toggleFilterItem($event, item.uid)">
          <item-label :item="item" :type="type"/>
          <span v-if="!item.uid">...</span>
          <span v-if="item.count">(<span v-html="getCountSnippet(item.count)"/>)</span>
          <item-selector :uid="item.uid" :item="item" :type="type"/>
        </b-form-checkbox>
      </div>
      <!-- bucket items -->
      <div class="items-to-add  mt-2" v-if="newItemsToAdd.length">
        <div v-for="(item, idx) in newItemsToAdd" :key="idx">
          <span v-if="type === 'topic'" v-html="item.htmlExcerpt"></span>
          <span v-if="['person', 'location', 'newspaper', 'entity'].indexOf(type) !== -1">{{ item.name }}</span>
          <span v-if="['language', 'country'].indexOf(type) !== -1">{{ $t(`buckets.${type}.${item.uid}`) }}</span>
          <collection-item v-if="type === 'collection'" :item="item" />
          <span v-if="item.count">(<span v-html="getCountSnippet(item.count)"/>)</span>
        </div>
      </div>
      <!-- local items -->
      <div v-for="item in entitiesToAdd" :key="item.uid" class="mt-2">
        <item-label :item="item" :type="type"/>
        <span v-if="!item.uid">...</span>
        <span v-if="item.count">(<span v-html="getCountSnippet(item.count)"/>)</span>
        <item-selector :uid="item.uid" :item="item" :type="type"/>
      </div>

      <!-- string to add -->
      <div class="strings-to-add m-2 ml-4" v-if="stringsToAdd.length">
        <b-form inline v-for="(item, idx) in stringsToAdd" :key="idx"
          class="mb-2">
          <b-form-input
            size="sm"
            placeholder="..." class="mr-1"
            v-model="item.uid" @click.prevent.stop >
          </b-form-input>
          <b-button class="dripicons-cross" variant="transparent" size="sm" style="padding:0.25rem 0.5rem 0 0.5rem"
            @click.prevent.stop="removeStringItem(idx)"
          />
        </b-form>
      </div>
    </div>
    <!-- add new string as an OR filter -->
    <div class="mt-3" v-if="StringTypes.includes(type)">
      <b-row no-gutters>
        <b-col cols="6">
          <div class="mr-1">
            <b-button size="sm" variant="outline-secondary" block
              @click.prevent.stop="addStringItem()" :disabled="hasEmptyStringItems">
                {{$t('actions.addItem')}}
            </b-button>
          </div>
        </b-col>
        <b-col cols="6">
          <div class="ml-1">
            <b-button size="sm" variant="outline-secondary" block
              v-on:click.prevent="showEmbeddings = !showEmbeddings;"
              >
                {{$t('actions.addUsingEmbeddings')}}
            </b-button>
          </div>
        </b-col>
      </b-row>
      <embeddings-search v-if="showEmbeddings"
                         v-bind:filter="editedFilter"
                         @click.stop.prevent
                         @embdding-selected="addEmbeddingSuggestion"/>


      <!-- <b-form-group v-if="checkbox">
       <b-form-radio-group
         switches
         :options="checkboxPrecisions"
         v-model="editedFilter.precision">
       </b-form-radio-group>
      </b-form-group> -->
    </div>

    <!-- entities only -->
    <div class="mt-3" v-if="EntityTypes.includes(type)">
      <b-row no-gutters>
        <b-col>
          <div>
            <!-- similar entities button -->
            <b-button
              size="sm"
              variant="outline-primary"
              :class="{ active : entitiesSuggestionsType === SuggestedEntitiesTypes.Similar }"
              block
              v-on:click.prevent="toggleEntitiesSuggestions(SuggestedEntitiesTypes.Similar)">
              {{ $t('label.similarEntities') }}
            </b-button>
          </div>
        </b-col>
        <b-col>
          <!-- co-occurring entities button -->
            <b-button
              class="border-left-0"
              size="sm"
              variant="outline-primary"
              :class="{ active : entitiesSuggestionsType === SuggestedEntitiesTypes.Related }"
              block
              v-on:click.prevent="toggleEntitiesSuggestions(SuggestedEntitiesTypes.Related)">
              {{ $t('label.relatedEntities') }}
            </b-button>
        </b-col>
      </b-row>

      <entities-suggestions-list
        v-if="entitiesSuggestionsType != null"
        :context="suggestedEntitiesContext"
        :suggestions-provider="getSuggestedEntities"
        :entities-to-add="entitiesToAdd"
        class="bg-light border-tertiary border-left border-right"
        @entity-selected="addEntitySuggestion"/>
    </div>

    <b-button
      class="mt-2"
      v-if="hasChanges"
      block
      size="sm"
      variant="outline-success"
      @click="applyChanges()">
      <span v-if="validStringsToAdd.length > 0 || newItemsToAdd.length > 0 || excludedItemsIds.length > 0 || entitiesToAdd.length > 0">
        {{
          $t('actions.applyChangesDetailed', {
            added: validStringsToAdd.length || newItemsToAdd.length || entitiesToAdd.length,
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
import EntitiesSuggestionsList from '@/components/modules/EntitiesSuggestionsList'
import { getSimilarEntities, getCoOccurringEntities } from '@/logic/entities'

import {
  toCanonicalFilter,
  toSerializedFilter,
  RangeFacets,
  NumericRangeFacets
} from '../../logic/filters'

const StringTypes = ['string', 'title']
const EntityTypes = ['person', 'location', 'entity']

/** @returns {number} */
const asNumber = any => parseInt(any, 10)

/** @returns {Date} */
const asDate = any => new Date(any)

const SuggestedEntitiesTypes = Object.freeze({
  Similar: 'similar',
  Related: 'related'
})

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').Entity} Entity
 */

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
    /** @type {string | undefined} */
    entitiesSuggestionsType:  undefined,
    editedFilter: /** @type {Filter} */ ({}),
    excludedItemsIds: /** @type {string[]} */ ([]),
    stringsToAdd: /** @type {{ uid: string, checked: boolean }[]} */ ([]),
    entitiesToAdd: /** @type {Entity[]} */ ([]),
    RangeFacets,
    NumericRangeFacets,
    StringTypes,
    EntityTypes,
    SuggestedEntitiesTypes
  }),
  props: {
    /** @type {import('vue').PropOptions<string[]>} */
    operators: {
      type: Array,
      default: () => ['OR'],
    },
    /** @type {import('vue').PropOptions<string[]>} */
    contexts: {
      type: Array,
      default: () => ['include', 'exclude'],
    },
    /** @type {import('vue').PropOptions<string[]>} */
    precisions: {
      type: Array,
      default: () => ['fuzzy', 'exact', 'soft'],
    },
    /* Render context, operators as checkboxes */
    /** @type {import('vue').PropOptions<boolean>} */
    checkbox: {
      type: Boolean,
      default: false,
    },
    /** @type {import('vue').PropType<Filter>} */
    filter: Object,
    /* filter items to be added to the filter when confirm button is clicked */
    /** @type {import('vue').PropOptions<Entity[]>} */
    newItemsToAdd: {
      type: Array,
      default: () => [],
    },
    /**
     * Optional list of filters where current filter is used.
     *
     * @type {import('vue').PropOptions<Filter[]>}
     */
    contextFilters: {
      type: Array
    }
  },
  computed: {
    /** @returns {boolean} */
    tooManyItems() {
      const filterItems = this.filter.items || []
      return this.stringsToAdd.length + filterItems.length + this.newItemsToAdd.length > 5;
    },
    /** @returns {boolean} */
    hasEmptyStringItems() {
      return this.stringsToAdd.length > 0 && this.stringsToAdd.filter(d => d.uid.length === 0).length > 0;
    },
    /** @returns {Entity[]} */
    validStringsToAdd() {
      return this.stringsToAdd.filter(d => d.checked && d.uid.length);
    },
    /** @return {{ [key: string]: Entity }} */
    checkedItems() {
      return this.availableItems.reduce((acc, item) => {
        acc[item.uid] = !this.excludedItemsIds.includes(item.uid)
        return acc
      }, {})
    },
    /** @returns {Entity[]} */
    availableItems() {
      const filterItems = this.filter.items || []
      return filterItems.concat(this.newItemsToAdd).concat(this.entitiesToAdd)
    },
    /** @returns {string} */
    type() { return this.filter.type || '' },
    /** @returns {{ text: string, value: string }[]} */
    checkboxPrecisions() {
      return this.precisions.map(value => ({
        text: this.$t(`label.${this.type}.precision.${value}`).toString(),
        value,
      }));
    },
    /** @returns {{ text: string, value: string }[]} */
    checkboxContexts() {
      return this.contexts.map(value => ({
        text: this.$t(`label.${this.type}.context.${value}`).toString(),
        value,
      }));
    },
    /** @returns {{ text: string, value: string }[]} */
    checkboxOperators() {
      return this.operators.map(value => ({
        text: this.$t(`op.${value}.${this.currentContext}`).toString(),
        value,
      }));
    },
    /** @returns {boolean} */
    hasChanges() {
      return this.newItemsToAdd.length > 0
        || this.validStringsToAdd.length > 0
        || this.excludedItemsIds.length > 0
        || this.entitiesToAdd.length > 0
        || toSerializedFilter(this.filter) !== toSerializedFilter(this.editedFilter)
    },
    currentContext: {
      /** @returns {string} */
      get() {
        return this.editedFilter.context
          ? this.editedFilter.context
          : 'include'
      },
      /** @param {string} value */
      set(value) { this.editedFilter.context = value }
    },
    /** @returns {Entity[]} */
    entities() {
      return this.filter.items ?? []
    },
    /** @returns {any} */
    suggestedEntitiesContext() {
      if (this.entitiesSuggestionsType === SuggestedEntitiesTypes.Similar) {
        return this.entities
      } else if (this.entitiesSuggestionsType === SuggestedEntitiesTypes.Related) {
        return { entities: this.entities, filters: this.contextFilters ?? [] }
      }
      return undefined;
    }
  },
  methods: {
    /** @returns {void} */
    applyChanges() {
      const { type } = this.editedFilter

      if (!StringTypes.includes(type) && !RangeFacets.includes(type)) {
        // Entities suggestions may add entities of more than one type.
        // In this case we need to change the original type of the filter to
        // a generic 'entity' type.
        const types = [...new Set((this.filter.items ?? []).concat(this.entitiesToAdd).map(({ type }) => type))]
        const updatedFilterType = types.length > 1
          ? 'entity'
          : this.filter.type

        const allItemsDictonary = (this.filter.items ?? [])
          .concat(this.newItemsToAdd)
          .concat(this.entitiesToAdd)
          .reduce((acc, item) => {
            acc[item.uid] = item
            return acc
          }, {})
        const availableItemsIds = [...new Set((this.filter.items ?? []).concat(this.newItemsToAdd).concat(this.entitiesToAdd).map(({ uid }) => uid))]
        const selectedItemsIds = availableItemsIds.filter(id => !this.excludedItemsIds.includes(id))
        const selectedItems = selectedItemsIds.map(id => allItemsDictonary[id])

        this.$emit('changed', {
          ...this.editedFilter,
          items: selectedItems,
          q: selectedItemsIds,
          type: updatedFilterType
        })
        this.entitiesToAdd = []
      } else if (StringTypes.includes(type)) {
        const newFilter = {
          ...this.editedFilter,
          q: (/** @type {string[]} */ (this.editedFilter.q) ?? [])
            .filter((d) => !this.excludedItemsIds.includes(d))
            .concat(this.validStringsToAdd.map(d => d.uid)),
        };
        this.$emit('changed', newFilter);
        this.stringsToAdd = [];
      } else {
        this.$emit('changed', this.editedFilter)
      }
    },
    /** @returns {void} */
    addStringItem() {
      this.stringsToAdd.push({
        uid: '',
        checked: true,
      });
    },
    /** @param {number} idx */
    removeStringItem(idx) {
      this.stringsToAdd.splice(idx, 1);
    },
    /**
     * @param {string} value
     * @param {number} idx
     */
    changeStringFilterItemAtIndex(value, idx) {
      this.editedFilter.q = (this.filter.items ?? []).map((d, i) => {
        if(i === idx) {
          return value;
        }
        return d.uid;
      }).filter(d => d.length);
    },
    /**
     * @param {boolean} selected
     * @param {string} uid
     */
    toggleFilterItem(selected, uid) {
      if (selected) {
        this.excludedItemsIds = this.excludedItemsIds.filter(id => id !== uid)
      } else {
        this.excludedItemsIds = this.excludedItemsIds.concat(uid)
      }
    },
    /**
     * @param {string} embedding
     */
    addEmbeddingSuggestion(embedding) {
      this.stringsToAdd.push({
        uid: embedding,
        checked: true,
      })
      // this.editedFilter.q = `${this.editedFilter.q} ${embedding}`
      // this.editedFilter.precisions = 'soft'
    },
    /**
     * @param {{ item: Entity, q: string }} param
     */
    handleRangeChanged({ item, q }) {
      this.editedFilter.q = q
      this.editedFilter.items = [item]
      if (!NumericRangeFacets.includes(this.editedFilter.type)) this.$emit('daterange-changed', this.editedFilter);
    },
    /**
     * @param {Entity} entity
     */
    addEntitySuggestion(entity) {
      const ids = /** @type {string[]} */ (this.editedFilter.q) ?? []
      if (ids.includes(entity.uid)) return
      this.editedFilter.q = [...ids, entity.uid]
      this.entitiesToAdd =  [...this.entitiesToAdd, entity]
    },
    /**
     * @param {number | undefined} count
     * @returns {string}
     */
    getCountSnippet(count) {
      return this.$tc('numbers.results', count, { n: this.$n(count ?? 0) })
    },
    asNumber,
    asDate,
    /** @param {string} type */
    toggleEntitiesSuggestions(type) {
      this.entitiesSuggestionsType = this.entitiesSuggestionsType === type
        ? undefined
        : type;
    },
    async getSuggestedEntities(context) {
      if (this.entitiesSuggestionsType === SuggestedEntitiesTypes.Similar) {
        return getSimilarEntities(context);
      } else if (this.entitiesSuggestionsType === SuggestedEntitiesTypes.Related) {
        return getCoOccurringEntities(context);
      }
      return [];
    }
  },
  components: {
    FilterDaterange,
    CollectionItem,
    EmbeddingsSearch,
    ItemLabel,
    ItemSelector,
    FilterNumberRange,
    EntitiesSuggestionsList
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
        if (this.newItemsToAdd) {
          const ids = /** @type {string[]} */ (this.editedFilter.q) ?? []
          this.editedFilter.q = ids.concat(this.newItemsToAdd.map(({ uid }) => uid))
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
.items .form-control.accepted {
  color: #343a40;
}
.items-to-add {
  background: yellow;
}
label.custom-control-label {
  font-variant: none;
}
.reduced {
  max-height: 200px;
  overflow:scroll;
}
</style>
<i18n>
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
      "similarEntities": "Similar Entities",
      "relatedEntities": "Co-occurring Entities",
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
      "entity": {
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
