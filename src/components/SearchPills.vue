<template lang="html">
  <div class='search-pills'>
    <b-dropdown size="sm" variant="outline-primary" class="mr-1 mb-1 search-pill"
      v-for="(filter, index) in pills" :key="filter.key">
      <!--  button content -->
      <template slot="button-content">
        <!-- badge: initial type instead of icons -->
        <span class="badge fp-type">{{ $t(`type.${filter.type}`) }}</span>
        <!--  type:string -->
        <span class="label fp-string" v-if="filter.type === 'string'" :class="filter.precision">
          {{filter.q}}
        </span>
        <!--  type:topic -->
        <span class="label fp-topic"
          v-if="filter.type === 'topic'">
          <span v-if="filter.item" v-html="filter.item.getHtmlExcerpt()"/>
          <span v-else class="dripicons-dots-2" />
        </span>
        <!--  type:newspaper -->
        <span class="label fp-newspaper"
          v-if="filter.type === 'newspaper'"
          v-html="labelByItems({ items: filter.items, max: 2 })">
        </span>
      </template>

      <div class="p-2 pb-1">
        <b-form-group :label="filter.type">
          <b-form-input
            size="sm"
            placeholder=""
            v-model="filter.q"
          ></b-form-input>
        </b-form-group>
        <b-button block size="sm" variant="outline-primary" @click="onRemoveFilter(filter)">{{$t('action.remove')}}</b-button>
      </div>
    </b-dropdown>
  </div>
</template>

<script>
export default {
  computed: {
    pills: {
      get() {
        // exclude boolean filters
        return this.$store.state.search.search.filters
          .filter(d => ['hasTextContents', 'isFront'].indexOf(d.type) === -1)
          .sort((a, b) => (a.type > b.type ? 1 : -1));
      },
    },

  },
  methods: {
    labelByItems({
      items = [],
      prop = 'name',
      max = 1,
    } = {}) {
      console.log('labelByItems', items);
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
  },
};
</script>

<style lang="scss">
.search-pill{
  position: relative;

  span.label{
    font-variant: normal;
    &.fp-string{
      background-color: #FFEB78;
    }
    &.fp-string.exact::before,
    &.fp-string.exact::after{
      content: '"';
    }
  }

  button.dropdown-toggle{
    padding-left: 1.75em;
  }

  span.badge.fp-type{
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

.op.or{
  font-variant: small-caps;
  font-weight: bold;
}
</style>
<i18n>
  {
    "en": {
      "action": {
        "remove": "remove",
        "apply": "apply"
      },
      "items": {
        "hidden": "({count} more)"
      },
      "operator": {
        "or": "or"
      },
      "type": {
        "string": "str",
        "newspaper": "n."
      }
    }
  }
</i18n>
