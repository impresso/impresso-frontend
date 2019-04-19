<template lang="html">
  <div class='search-pills'>
    <b-dropdown size="sm" variant="outline-primary" class="mr-1 mb-1 search-pill"
      v-for="(filter, index) in pills" :key="filter.key">
      <!--  button content -->
      <template slot="button-content">
        <!-- badge: initial type instead of icons -->
        <span class="badge sp-type">{{ $t(`type.${filter.type}`) }}</span>
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
        <div class="description">{{filter.type}}</div>

        <!--  include / exclude toggler -->
        {{ filter.touched }}
        <b-form-group>
          <b-form-radio-group
            stacked
            v-model="filter.context"
            v-bind:options="filterContextOptions"
            @change="onChangeFilter(filter)">
          </b-form-radio-group>
        </b-form-group>

        <ul v-if="filter.type === 'topic'">
          <topic-list-item :item="item" v-for="item in filter.items" :key="item.uid"/>
        </ul>
        <ul v-if="filter.type === 'newspaper'">
          <newspaper-list-item :item="item" v-for="item in filter.items" :key="item.uid"/>
        </ul>
        <b-form-group :label="filter.type" v-if="filter.type === 'string'">
          <b-form-input
            size="sm"
            placeholder=""
            v-model="filter.q"
            @change="onChangeFilter(filter)">
          </b-form-input>
        </b-form-group>
      </div>

      <div class="px-2 mt-1 mb-2">
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
  },
};
</script>

<style lang="scss">


.search-pill{
  position: relative;

  span.label{
    font-variant: normal;
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
    padding-left: 1.75em;
  }

  span.badge.sp-type{
    border: 1px solid;
    width: 1.5em;
    height: 1.5em;
    position: absolute;
    left: 3px;
    overflow: hidden;
    top: 50%;
    margin-top: -0.75em;
    line-height: 1.2em;
    padding: 0 0.15rem;
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
