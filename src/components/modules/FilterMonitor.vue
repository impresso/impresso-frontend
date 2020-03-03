<template lang="html">
  <div class="filter-monitor">
    <div v-if="checkbox">
      <!--  context -->
      <b-form-group>
        <b-form-radio-group
          switches
          v-model="filter.context"
          v-bind:options="checkboxContexts"
          @change="changeFilterContext($event)">
        </b-form-radio-group>
      </b-form-group>
      <!--  operator -->
      <b-form-group v-if="filter.context === 'include' && filter.items && filter.items.length > 1">
        <b-form-radio-group
          switches
          v-model="filter.op"
          v-bind:options="checkboxOperators"
          @change="changeFilterOperator($event)">
        </b-form-radio-group>
      </b-form-group>
    </div>

    <div v-else>
      <!--  context -->
      <b-dropdown size="sm" variant="outline-primary" class="mr-1">
        <template slot="button-content">
          <span v-html="$t(`label.${type}.context.${filter.context}`)"/>
        </template>
        <b-dropdown-item
          v-for="option in contexts"
          v-bind:active="filter.context === option"
          v-bind:key="option"
          v-on:click="changeFilterContext(option)"
        ><span class="small" v-html="$t(`label.${type}.context.${option}`)"></span></b-dropdown-item>
      </b-dropdown>
      <!--  operator -->
      <b-dropdown v-if="operators.length > 1" size="sm" variant="outline-primary">
        <template slot="button-content">
          <span v-html="$t(`op.${filter.op}.${filter.context}`)"/>
        </template>
        <b-dropdown-item
          v-for="option in operators"
          v-bind:active="filter.op === option"
          v-bind:key="option"
          v-on:click="changeFilterOperator(option)"
        ><span class="small" v-html="$t(`op.${option}.${filter.context}`)"></span></b-dropdown-item>
      </b-dropdown>
    </div>
    <!-- for strings -->
    <div v-if="['string', 'title'].indexOf(filter.type) !== -1">
      <b-form-group :label="$t(`label.${filter.type}.value`)">
        <b-form-input
          size="sm"
          placeholder=""
          :value="filter.q"
          @input.native="changeFilterQ($event.target.value)"
          @change="changeFilterQ($event)">
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
                           v-bind:filter="filter"
                           @embdding-selected="addEmbeddingSuggestion"/>
      </div>

      <!--  context -->
      <b-form-group v-if="checkbox">
        <b-form-radio-group
          switches
          v-model="filter.precision"
          v-bind:options="checkboxPrecisions"
          @change="changeFilterPrecision($event)">
        </b-form-radio-group>
      </b-form-group>
    </div>
    <div v-for="item in filter.items" :key="item.uid" class="mt-2">
      <div v-if="type === 'daterange'">
        <filter-daterange :daterange="item" @change="updateFilterItem($event.item, $event.uid)"></filter-daterange>
      </div>
      <b-form-checkbox v-else v-model="item.checked" @change="toggleFilterItem($event, item)">
        <item-label :item="item" :type="type"/>
        <span v-if="!item.uid.length">...</span>
        <span v-if="item.count">(<span v-html="$tc('numbers.results', item.count, { n: $n(item.count) })"/>)</span>
        <item-selector :uid="item.uid" :item="item" :type="filter.type"/>
      </b-form-checkbox>
    </div>
    <div class="items-to-add" v-if="itemsToAdd.length">
      <div v-for="item in itemsToAdd" :key="item.uid">
        <span v-if="type === 'topic'" v-html="item.htmlExcerpt"></span>
        <span v-if="['person', 'location', 'newspaper'].indexOf(type) !== -1">{{ item.name }}</span>
        <span v-if="['language', 'country'].indexOf(type) !== -1">{{ $t(`buckets.${type}.${item.uid}`) }}</span>
        <collection-item v-if="type === 'collection'" :item="item" />
        <span v-if="item.count">(<span v-html="$tc('numbers.results', item.count, { n: $n(item.count) })"/>)</span>
      </div>
    </div>

    <b-button class="mt-2" v-if="filter.touched || itemsToAdd.length" block size="sm" variant="outline-primary" @click="applyFilter()">
      <span v-if="filter.items && (itemsToAdd.length || filter.items.length - filter.q.length)">
        {{
          $t('actions.applyChangesDetailed', {
            added: itemsToAdd.length,
            removed: filter.items.length - filter.q.length
          })
        }}
      </span>
      <span v-else>{{ $t(`actions.applyChanges`)}}</span>
    </b-button>
  </div>
</template>

<script>
import FilterDaterange from './FilterDateRange';
import ItemSelector from './ItemSelector';
import ItemLabel from './lists/ItemLabel';
import CollectionItem from './lists/CollectionItem';
import EmbeddingsSearch from './EmbeddingsSearch';

export default {
  data: () => ({
    q: '',
    showEmbeddings: false,
  }),
  props: {
    type: {
      type: String,
      default: '',
    }, // being topic, newspaper, collection, language ...
    store: {
      type: String,
      default: 'search',
    },
    searchQueryId: {
      // [Optional] ID of the search query the filter belongs to.
      // This ID is dispatched to the the store.
      type: String,
      default: undefined,
    },
    skipPushSearchParams: {
      type: Boolean,
      default: false,
    },
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
    checkbox: {
      type: Boolean,
      default: false,
    },
    filter: Object,
    itemsToAdd: {
      type: Array, // from outside
      default: () => [],
    },
  },
  computed: {
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
        text: this.$t(`op.${value}.${this.filter.context}`),
        value,
      }));
    },
    hasMultipleWords() {
      if (typeof this.filter.q === 'string') {
        return this.filter.q.trim().split(/\s/).length > 1;
      }
      return false;
    },
  },
  methods: {
    applyFilter() {
      this.updateFilter({});
      const { searchQueryId, filter } = this;
      this.$emit('filter-applied', filter);
      if (!this.skipPushSearchParams) {
        this.$store.dispatch(`${this.store}/PUSH_SEARCH_PARAMS`, { searchQueryId });
      }
    },
    updateFilter({ op, context }) {
      let q;
      if (this.filter.items) {
        // caclulate new q every time. if it's empty
        q = this.filter.items.concat(this.itemsToAdd).reduce((acc, d) => {
          // console.info('methods.updateFilter: adding uid:', d.uid, d.checked);
          if (d.checked) {
            acc.push(d.uid);
          }
          return acc;
        }, []);
      } else {
        q = this.filter.q;
      }

      const { searchQueryId, filter } = this;

      if (!q.length) {
        this.$store.dispatch(`${this.store}/REMOVE_FILTER`, {
          filter,
          searchQueryId,
        });
        this.$emit('filter-removed');
        return;
      }

      this.$store.dispatch(`${this.store}/UPDATE_FILTER`, {
        filter,
        searchQueryId,
        q,
        op,
        context,
      });
      this.$emit('filter-updated');
    },
    changeFilterQ(q) {
      const { searchQueryId, filter } = this;
      this.$store.dispatch(`${this.store}/UPDATE_FILTER`, {
        filter,
        searchQueryId,
        q,
      });
      this.$emit('filter-updated');
    },
    changeFilterOperator(op) {
      this.updateFilter({ op });
    },
    changeFilterContext(context) {
      // console.info('@changeFilterContext', context);
      this.updateFilter({ context });
    },
    changeFilterPrecision(precision) {
      const { searchQueryId, filter } = this;
      // console.info('@changeFilterContext', context);
      this.$store.dispatch(`${this.store}/UPDATE_FILTER`, {
        filter,
        searchQueryId,
        precision,
      });
      this.$emit('filter-updated');
    },
    changeFilterDistance(distance) {
      const { searchQueryId, filter } = this;
      // console.info('@changeFilterContext', context);
      this.$store.dispatch(`${this.store}/UPDATE_FILTER`, {
        filter,
        searchQueryId,
        distance,
      });
      this.$emit('filter-updated');
    },
    toggleFilterItem(checked, item) {
      item.checked = checked;
      this.updateFilterItem(item);
    },
    updateFilterItem(item, uid) {
      const { searchQueryId, filter } = this;
      this.$store.dispatch(`${this.store}/UPDATE_FILTER_ITEM`, {
        filter,
        searchQueryId,
        item,
        uid,
      });
      console.info('updateFilterItem', filter);
      this.$emit('filter-updated');
    },
    addEmbeddingSuggestion(embedding) {
      const { searchQueryId, filter } = this;
      this.$store.dispatch(`${this.store}/UPDATE_FILTER`, {
        filter,
        searchQueryId,
        precision: 'soft',
        q: `${filter.q} ${embedding}`,
      });
      this.$emit('filter-updated');
    },
  },
  components: {
    FilterDaterange,
    CollectionItem,
    EmbeddingsSearch,
    ItemLabel,
    ItemSelector,
  },
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
