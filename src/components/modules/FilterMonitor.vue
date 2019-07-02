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
      <b-dropdown size="sm" variant="outline-primary">
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
      <b-form-checkbox v-model="item.checked" @change="toggleFilterItem($event, item)">
        <span v-if="type === 'topic'" v-html="item.htmlExcerpt"></span>
        <span v-if="type === 'newspaper'">{{ item.name }}</span>
        <collection-item v-if="type === 'collection'" :item="item" />
        <div v-if="type === 'daterange'">
          <filter-daterange :daterange="item" @change="updateFilterItem($event.item, $event.uid)"></filter-daterange>
        </div>
        <span v-if="type === 'language'">{{ $t(`languages.${item.uid}`) }}</span>
        <span v-if="item.count">({{ $t('numbers.results', { results: $n(item.count) }) }})</span>
      </b-form-checkbox>
    </div>
    <div class="items-to-add" v-if="itemsToAdd.length">
      <div v-for="item in itemsToAdd">
        <span v-if="type === 'topic'" v-html="item.htmlExcerpt"></span>
        <span v-if="type === 'newspaper'">{{ item.name }}</span>
        <span v-if="type === 'language'">{{ $t(`languages.${item.uid}`) }}</span>
        <collection-item v-if="type === 'collection'" :item="item" />
        <span v-if="item.count">({{ $t('numbers.results', { results: $n(item.count) }) }})</span>
      </div>
    </div>

    <b-button
      size="sm" variant="outline-primary" class="border bg-light mt-2 w-100"
      v-if="filter.q != null"
      v-on:click="showEmbeddings = !showEmbeddings; embeddingsOnSubmit()"
      v-bind:class="{ 'border-bottom-0': showEmbeddings }">
      {{$t('Add word embeddings to query')}}
    </b-button>

    <div class="border pt-3 px-2 bg-light" v-show="showEmbeddings">
      <b-form-group>
        <form v-on:submit.prevent="embeddingsOnSubmit()">
          <b-row>
            <b-col cols="12" class="input-group">
              <b-form-input
                type="text"
                size="sm"
                class="form-control"
                placeholder="term"
                ref="inputE"
                :value="inputEmbeddings(filter.q)"
                name="inputEmbeddings" />
                <div class="input-group-append">
                  <b-form-select name="languageEmbeddings"
                    v-model="languageEmbeddings"
                    :options="languageEmbeddingsOptions"
                    v-on:change="embeddingsOnSubmit()"
                    size="sm" variant="outline-primary" />
                </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col class="mt-2">
                <div v-if="embeddings[0] === '_fetching'">
                  <i-spinner class="text-center p-3" />
                </div>
                <div v-else-if="embeddings[0] === '_error'" class="alert alert-danger" role="alert">
                  {{embeddings[1]}}
                </div>
                <div v-else>
                  <a
                    v-for="embedding in embeddings"
                    :title="`add “${embedding}” to search query`"
                    class="mr-2 mt-2 border px-2 d-inline-block"
                    v-on:click="filter.q = `${filter.q} ${embedding}`; filter.touched = true;">
                    {{embedding}}
                  </a>
                </div>
            </b-col>
          </b-row>
        </form>
      </b-form-group>
    </div>


    <b-button class="mt-2" v-if="filter.touched || itemsToAdd.length" block size="sm" variant="outline-primary" @click="applyFilter()">
      <span v-if="filter.items && (itemsToAdd.length || filter.items.length - filter.q.length)">
        {{
          $t(`label.${type}.update`, {
            added: itemsToAdd.length,
            removed: filter.items.length - filter.q.length  
          })
        }}
      </span>
      <span v-else>{{ $t(`label.${type}.apply`)}}</span>
    </b-button>
  </div>
</template>

<script>
import FilterDaterange from './FilterDateRange';
import CollectionItem from './lists/CollectionItem';

export default {
  data: () => ({
    q: '',
    showEmbeddings: false,
  }),
  props: {
    type: String, // being topic, newspaper, collection, language ...
    store: {
      type: String,
      default: 'search',
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
    languageEmbeddingsOptions: {
      get() {
        return [
          { value: 'en', text: 'English' },
          { value: 'fr', text: 'French' },
          { value: 'de', text: 'German' },
          { value: 'lu', text: 'Lëtz.' },
        ];
      },
    },
    languageEmbeddings: {
      get() {
        return this.$store.state.embeddings.language;
      },
      set(languageEmbeddings) {
        this.$store.commit('embeddings/UPDATE_LANGUAGE', languageEmbeddings);
      },
    },
    embeddings: {
      get() {
        return this.$store.state.embeddings.embeddings;
      },
    },
  },
  methods: {
    applyFilter() {
      this.updateFilter({});
      this.$emit('filter-applied');
      this.$store.commit(`${this.store}/UPDATE_PAGINATION_CURRENT_PAGE`, 1);
      this.$store.dispatch(`${this.store}/PUSH_SEARCH_PARAMS`);
    },
    updateFilter({ op, context }) {
      console.log('methods.updateFilter: op:', op, context);
      let q;
      if (this.filter.items) {
        // caclulate new q every time. if it's empty
        q = this.filter.items.concat(this.itemsToAdd).reduce((acc, d) => {
          // console.log('methods.updateFilter: adding uid:', d.uid, d.checked);
          if (d.checked) {
            acc.push(d.uid);
          }
          return acc;
        }, []);
      } else {
        q = this.filter.q;
      }

      if (!q.length) {
        this.$store.commit(`${this.store}/REMOVE_FILTER`, this.filter);
        this.$emit('filter-removed');
        return;
      }

      // commit the update
      this.$store.commit(`${this.store}/UPDATE_FILTER`, {
        filter: this.filter,
        q,
        op,
        context,
      });
      this.$emit('filter-updated');
    },
    changeFilterQ(q) {
      this.$store.commit(`${this.store}/UPDATE_FILTER`, {
        filter: this.filter,
        q,
      });
      this.$emit('filter-updated');
    },
    changeFilterOperator(op) {
      this.updateFilter({ op });
    },
    changeFilterContext(context) {
      // console.log('@changeFilterContext', context);
      this.updateFilter({ context });
    },
    changeFilterPrecision(precision) {
      // console.log('@changeFilterContext', context);
      this.$store.commit(`${this.store}/UPDATE_FILTER`, {
        filter: this.filter,
        precision,
      });
      this.$emit('filter-updated');
    },
    changeFilterDistance(distance) {
      // console.log('@changeFilterContext', context);
      this.$store.commit(`${this.store}/UPDATE_FILTER`, {
        filter: this.filter,
        distance,
      });
      this.$emit('filter-updated');
    },
    toggleFilterItem(checked, item) {
      item.checked = checked;
      this.updateFilterItem(item);
    },
    updateFilterItem(item, uid) {
      this.$store.commit(`${this.store}/UPDATE_FILTER_ITEM`, {
        filter: this.filter,
        item,
        uid,
      });
    },
    inputEmbeddings(q) {
      const firstWord = q.trim().split(' ').pop();
      // console.log(firstWord);
      return firstWord;
    },
    embeddingsOnSubmit() {
      console.log('input:', this.$refs);
      this.$store.dispatch('embeddings/FIND', this.$refs.inputE.$el.value);
    },
  },
  components: {
    FilterDaterange,
    CollectionItem,
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
    "op": {
      "OR": {
        "include": "at least <b>one</b> of the following",
        "exclude": "<b>any</b> of the following"
      },
      "AND": {
        "include": "<b>all</b> of the following",
        "exclude": "<b>any</b> of the following"
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
        "clear": "reset"
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
