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
            {'dripicons-web': filter.type === 'language'}
          ]" />
        <!--  type:string -->
        <span class="label sp-string" v-if="filter.type === 'string'" :class="filter.precision">
          {{filter.q}}
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
      </template>

      <div class="p-2 pb-1 sp-contents">
        <div class="description">{{ $t(`label.${filter.type}`) }}</div>
        <filter-monitor checkbox :filter="filter" :type="filter.type" :operators="['AND', 'OR']" />


        <b-form-group :label="filter.type" v-if="filter.type === 'string'">
          <b-form-input
            size="sm"
            placeholder=""
            v-model="filter.q"
            @change="onChangeFilter(filter)">
          </b-form-input>
        </b-form-group>
      </div>

      <div v-if="filter.type === 'string'" class="px-2 mt-1 mb-2">
        <b-button-group>
          <b-button  size="sm" variant="outline-primary" :disabled="!filter.touched"
            @click="onApplyFilter(filter)">
            {{$t('action.apply')}}
          </b-button>
          <b-button  size="sm" variant="outline-primary" :disabled="!filter.touched"
            @click="onApplyFilter(filter)">
            {{$t('action.undo')}}
          </b-button>
          <b-button  size="sm" variant="outline-primary" @click="onRemoveFilter(filter)">{{$t('action.remove')}}</b-button>
        </b-button-group>
      </div>
    </b-dropdown>
  </div>
</template>

<script>
import TopicListItem from './modules/TopicListItem';
import NewspaperListItem from './modules/NewspaperListItem';
import FilterMonitor from './modules/FilterMonitor';

export default {
  computed: {
    pills: {
      get() {
        // exclude boolean filters
        return this.$store.state.search.search.filters
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
    onRemoveFilter(filter) {
      this.$emit('remove', filter);
    },
    onChangeFilter(filter) {
      console.log('changed');
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

    &.sp-string{
      background-color: #FFEB78;
    }
    &.sp-string.exact::before,
    &.sp-string.exact::after{
      content: '"';
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
  }

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
