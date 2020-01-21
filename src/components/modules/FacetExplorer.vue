<template lang="html">
  <div>
    <div class="mb-1 border-bottom">
      <!-- The Loop -->
      <b-form-checkbox-group v-model="selectedIds" class="position-relative p-2" style="min-height: 4em; max-height: 16em; overflow: scroll">
        <div
          v-if='isLoading'
          class="position-absolute w-100 h-100"
          style="z-index:1; left:-1px; background:rgba(255,255,255,0.8)">
          <i-spinner class="text-center pt-4" />
        </div>
        <b-form-checkbox v-for="(bucket, idx) in buckets" v-bind:key="idx" :value="bucket.val" class="d-block">
          <item-label v-if="bucket.item" :item="bucket.item" :type="type" />
          <span v-if="bucket.count > -1">
            (<span v-html="$tc('numbers.results', bucket.count, { n : $n(bucket.count) })"/>)
          </span>
          <item-selector :uid="bucket.val" :item="bucket.item" :type="type"/>
          <div class="matches" v-if="bucket.item && bucket.item.matches">
            <span v-for="(match, i) in bucket.item.matches" v-html="match" :key="i"/>
          </div>
        </b-form-checkbox>
      </b-form-checkbox-group>
    </div>
    <!-- Apply! -->
    <b-button v-if='selectedIds.length' @click="applyFilter()" class="w-100 my-2 btn btn-sm btn-outline-primary"
      v-html="$tc('actions.addToCurrentFiltersDetailed', selectedIds.length)"></b-button>

  </div>
</template>

<script>
import ItemLabel from './lists/ItemLabel';
import ItemSelector from './ItemSelector';

export default {
  data: () => ({
    selectedIds: [],
  }),
  props: {
    q: {
      type: String,
      default: '',
    },
    store: {
      type: String,
      default: 'search',
    },
    facet: {
      type: Object,
    },
    initialType: {
      type: String,
      required: true,
    },
  },
  computed: {
    type: {
      get() {
        return this.$store.state.buckets.type;
      },
    },
    isTypeSearchable: {
      get() {
        return this.$store.state.buckets.searchables.includes(this.type);
      },
    },
    typeOptions: {
      get() {
        return this.$store.state.buckets.typeOptions;
      },
    },
    buckets: {
      get() {
        return this.$store.state.buckets.items;
      },
    },
    isLoading: {
      get() {
        return this.$store.state.buckets.isLoading;
      },
    },
    orderBy: {
      get() {
        return this.$store.state.buckets.orderBy;
      },
    },
    orderByOptions: {
      get() {
        switch (this.type) {
          case 'topic' :
            return ['name', '-name', 'model', '-model'];
          case 'country' :
            return ['date', '-date', 'relevance', '-relevance'];
          default:
            return ['name', 'count', 'count-mentions'];
        }
      },
    },
  },
  methods: {
    applyFilter() {
      console.info('submit', this.type, this.selectedIds);
      this.$emit('submit-buckets', {
        type: this.type,
        q: this.selectedIds,
      });
      this.selectedIds = [];
    },
  },
  components: {
    ItemLabel,
    ItemSelector,
  },
};
</script>

<style scoped lang="less">

.fixed-pagination-footer {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #f2f2f2;
  max-width: 100%;
}
</style>
<i18n>
{
  "en": {
    "searchField": {
      "placeholder": "...|There is only one choice...|Search one of {n} available choices",
      "notAvailable": "...|There is only one choice:|Pick one of the <span class='number'>{n}</span> available choiches:"
    },
    "switchTypes": {
      "collection": "all collections",
      "country": "all publication countries",
      "newspaper": "all newspapers",
      "language": "all languages",
      "location": "all locations mentioned",
      "person": "all people mentioned",
      "topic": "all topics computed"
    },
    "orderBy": {
      "title": "Order by",
      "name": "Name (a-z)",
      "-name": "Name (z-a)",
      "model": "Model (asc)",
      "-model": "Model (desc)",
      "count": "Count (most)",
      "-count": "Count (least)",
      "count-mentions": "Mentions (most)",
      "-count-mentions": "Mentions (least)"
    }
  }
}
</i18n>
