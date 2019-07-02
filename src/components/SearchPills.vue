<template lang="html">
  <div class='search-pills'>
    <b-dropdown size="sm" variant="outline-primary" class="mr-1 mb-1 search-pill"
      v-for="(filter, index) in pills" :key="filter.key">
      <!--  button content -->
      <template slot="button-content">
        <!-- badge: initial type instead of icons -->
        <span
          class="filter-icon"
          :class="[
            {'dripicons-align-justify': filter.type === 'string'},
            {'dripicons-message': filter.type === 'topic'},
            {'dripicons-pamphlet': filter.type === 'newspaper'},
            {'dripicons-web': filter.type === 'language'},
            {'dripicons-calendar': filter.type === 'daterange'},
            {'dripicons-suitcase': filter.type === 'collection'},
          ]" />
        <!--  type:string -->
        <span class="label sp-string" v-if="filter.type === 'string'" :class="filter.precision">
          {{filter.q}}
        </span>
        <!--  type:string -->
        <span class="label sp-title" v-if="filter.type === 'title'" >
          <span class="sp-string" :class="filter.precision">{{filter.q}}</span>
        </span>
        <!--  type:topic -->
        <span class="label sp-topic"
          v-if="filter.type === 'topic'"
          v-html="labelByItems({ items: filter.items, max: 2, prop: 'htmlExcerpt' })"
          :class="filter.context">
        </span>
        <!--  type:newspaper -->
        <span class="label sp-newspaper"
          v-if="filter.type === 'newspaper'"
          v-html="labelByItems({ items: filter.items, max: 2 })"
          :class="filter.context">
        </span>
        <!--  type:language -->
        <span class="label sp-language"
          v-if="filter.type === 'language'"
          :class="filter.context">
          {{$t(`language.${filter.q}`)}}
        </span>
        <!--  type:collections -->
        <span class="label sp-collection"
          v-if="filter.type === 'collection'"
          v-html="labelByItems({ items: filter.items, max: 2 })"
          :class="filter.context">
        </span>

        <!--  type:daterange -->
        <span class="label sp-daterange"
          v-if="filter.type === 'daterange'"
          :class="filter.context" v-html="labelByDaterangeItems({ items: filter.items, max: 2 })">
        </span>
        <!-- <span class="filter-icon filter-remove dripicons-cross" @click="onRemoveFilter(filter)"></span> -->
      </template>

      <div class="p-2 pb-1 sp-contents">
        <div class="description">{{ $t(`label.${filter.type}.title`) }}</div>
        <filter-monitor :store="store" checkbox :filter="filter" :type="filter.type" :operators="['AND', 'OR']" />

                <b-button
                  size="sm" variant="outline-primary" class="border bg-light mt-2 w-100"
                  v-if="filter.q != null"
                  v-on:click="showEmbeddings[index] = !showEmbeddings[index]; embeddingsOnSubmit(index)"
                  v-bind:class="{ 'border-bottom-0': showEmbeddings[index] }">
                  {{$t('Add word embeddings to query')}}
                </b-button>

                <div class="border pt-3 px-2 bg-light" v-show="showEmbeddings[index]">
                  <b-form-group>
                    <form v-on:submit.prevent="embeddingsOnSubmit(index)">
                      <b-row>
                        <b-col cols="8" class="input-group">
                          <b-form-input
                            type="text"
                            size="sm"
                            class="form-control"
                            placeholder="term"
                            ref="inputE"
                            :value="inputEmbeddings(filter.q)"
                            name="inputEmbeddings" />
                            <div class="input-group-append">
                              <b-button
                                size="sm" variant="outline-primary"
                                v-on:click.prevent="embeddingsOnSubmit(index)">GO!
                              </b-button>
                            </div>
                        </b-col>
                        <b-col cols="4" class="text-right">

                          <b-form-select name="languageEmbeddings"
                            v-model="languageEmbeddings"
                            :options="languageEmbeddingsOptions"
                            v-on:change="embeddingsOnSubmit(index)"
                            size="sm" variant="outline-primary" />
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

      </div>


      <!-- type is not string, add Remove button -->
      <div class="px-2 mt-1 mb-2">
        <b-button block size="sm" variant="outline-primary" @click="onRemoveFilter(filter)">{{$t('action.remove')}}</b-button>
      </div>
    </b-dropdown>
  </div>
</template>

<script>
import TopicListItem from './modules/TopicListItem';
import NewspaperListItem from './modules/NewspaperListItem';
import FilterMonitor from './modules/FilterMonitor';

export default {
  data: () => ({
    showEmbeddings: [],
  }),
  props: {
    store: {
      type: String,
      default: 'search',
    },
  },
  computed: {
    currentStore() {
      if (this.store === 'searchImages') {
        return this.$store.state.searchImages;
      }
      return this.$store.state.search;
    },
    pills: {
      get() {
        // exclude boolean filters
        return this.currentStore.search.filters
          .filter(d => ['hasTextContents', 'isFront'].indexOf(d.type) === -1);
          // .sort((a, b) => (a.type > b.type ? 1 : -1));
      },
    },
    filterContextOptions: {
      get() {
        return [
          {
            value: 'include',
            text: this.$t('context.include'),
          },
          {
            value: 'exclude',
            text: this.$t('context.exclude'),
          },
        ];
      },
    },
    languageEmbeddingsOptions: {
      get() {
        return [
          { value: 'en', text: 'English' },
          { value: 'fr', text: 'French' },
          { value: 'de', text: 'German' },
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
    labelByItems({
      items = [],
      prop = 'name',
      max = 1,
    } = {}) {
      let labels = items.slice(0, max)
        .map(d => d[prop] || '...').join(`<span class="op or px-1">${this.$t('operator.or')}</span>`);
      if (items.slice(max).length) {
        labels += this.$t('items.hidden', {
          count: items.slice(max).length,
        });
      }

      return labels;
    },
    labelByDaterangeItems({
      items = [],
      max = 1,
    } = {}) {
      let labels = items.slice(0, max).map(d => this.$t('label.daterange.item', {
        start: this.$d(d.start, 'compact'),
        end: this.$d(d.end, 'compact'),
      })).join(`<span class="op or px-1">${this.$t('operator.or')}</span>`);
      if (items.slice(max).length) {
        labels += this.$t('items.hidden', {
          count: items.slice(max).length,
        });
      }
      return labels;
    },
    onRemoveFilter(filter) {
      this.$emit('remove', filter);
    },
    onChangeFilter(filter) {
      filter.touched = true;
    },
    onApplyFilter(filter) {
      this.$emit('update', filter);
    },
    inputEmbeddings(q) {
      const firstWord = q.trim().split(' ').pop();
      // console.log(firstWord);
      return firstWord;
    },
    embeddingsOnSubmit(index) {
      // console.log('input:', this.$refs.inputE[index].$el.value);
      this.$store.dispatch('embeddings/FIND', this.$refs.inputE[index].$el.value);
    },
  },
  components: {
    TopicListItem,
    NewspaperListItem,
    FilterMonitor,
  },
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
    &>.sp-string.soft::before,{
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
        "topic": {
          "title": "filter by topic"
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
        }
      },
      "action": {
        "remove": "remove filter",
        "apply": "apply changes",
        "undo": "undo changes"
      },
      "items": {
        "hidden": "({count} more)"
      },
      "operator": {
        "or": "or"
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
