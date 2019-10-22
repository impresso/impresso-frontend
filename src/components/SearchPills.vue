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
            {'dripicons-minus': filter.type === 'title'},
            {'dripicons-message': filter.type === 'topic'},
            {'dripicons-user': filter.type === 'person'},
            {'dripicons-location': filter.type === 'location'},
            {'dripicons-pamphlet': filter.type === 'newspaper'},
            {'dripicons-web': filter.type === 'language'},
            {'dripicons-calendar': filter.type === 'daterange'},
            {'dripicons-suitcase': filter.type === 'collection'},
          ]" />
        <!--  type:string -->
        <span class="label sp-string" v-if="filter.type === 'string'" :class="[filter.precision,filter.context]">
          {{filter.q}}
        </span>
        <!--  type:string -->
        <span class="label sp-title" v-if="filter.type === 'title'" >
          <span class="sp-string" :class="filter.precision">{{filter.q}}</span>
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
          v-if="['language', 'country'].indexOf(filter.type) !== -1"
          v-html="labelByItems({ items: filter.items, max: 2, prop:'uid', translate: true, type:filter.type, op: filter.op })"
          :class="filter.context">
        </span>
        <!--  type:collections -->
        <span class="label sp-collection"
          v-if="filter.type === 'collection'"
          v-html="labelByItems({ items: filter.items, max: 2, op: filter.op })"
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
      </div>

      <!-- type is not string, add Remove button -->
      <div class="px-2 mt-1 mb-2">
        <b-button block size="sm" variant="outline-primary" @click="onRemoveFilter(filter)">{{$t('actions.remove')}}</b-button>
      </div>
    </b-dropdown>
  </div>
</template>

<script>
import TopicListItem from './modules/TopicListItem';
import NewspaperListItem from './modules/NewspaperListItem';
import FilterMonitor from './modules/FilterMonitor';

export default {
  props: {
    excludedTypes: {
      type: Array,
      default: () => ['hasTextContents', 'isFront'],
    },
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
          .filter(d => this.excludedTypes.indexOf(d.type) === -1);
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
  },
  methods: {
    labelByItems({
      items = [],
      prop = 'name',
      max = 1,
      op = 'OR',
      translate = false,
      type = 'label',
    } = {}) {
      let labels = items.slice(0, max)
        .map((d) => {
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
    labelByDaterangeItems({
      items = [],
      max = 1,
    } = {}) {
      let labels = items.slice(0, max).map(d => this.$t('label.daterange.item', {
        start: this.$d(d.start, 'compact'),
        end: this.$d(d.end, 'compact'),
      })).join(`<span class="op or px-1">${this.$t('op.or')}</span>`);
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
