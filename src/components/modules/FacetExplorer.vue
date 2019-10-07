<template lang="html">
  <div>
    <div class="mb-1 pb-2 border-bottom">
      <!-- The Loop -->
      <b-form-checkbox-group v-model="selectedIds" class="position-relative" style="min-height: 4em;">
        <div
          v-if='isLoading'
          class="position-absolute w-100 h-100"
          style="z-index:1; left:-1px; background:rgba(255,255,255,0.8)">
          <i-spinner class="text-center pt-4" />
        </div>
        <b-form-checkbox v-for="(bucket, idx) in buckets" v-bind:key="idx" :value="bucket.val" class="d-block">
          <item-label v-if="bucket.item" :item="bucket.item" :type="type" />
          <span v-if="bucket.count > -1">( {{ $n(bucket.count) }} )</span>
          <item-selector :uid="bucket.val" :item="bucket.item" :type="type"/>
          <div class="matches" v-if="bucket.item && bucket.item.matches">
            <span v-for="match in bucket.item.matches" v-html="match" :key="i"/>
          </div>
        </b-form-checkbox>
      </b-form-checkbox-group>
    </div>
    <!-- Apply! -->
    <b-button v-if='selectedIds.length' @click="applyFilter()" class="w-100 my-2 btn btn-sm btn-outline-primary"
      v-html="$tc('actions.addToCurrentFiltersDetailed', selectedIds.length)"></b-button>

    <!--  Pagination -->
    <div
      v-if="paginationTotalRows > paginationPerPage" class="p-3">
      <div
        class="fixed-pagination-footer mb-2 p-1">
        <pagination
          v-model="paginationCurrentPage"
          v-bind:perPage="paginationPerPage"
          v-bind:totalRows="paginationTotalRows"
          v-bind:showDescription="false"
           />
      </div>
    </div>
  </div>
</template>

<script>
import FilterFacetBucket from './FilterFacetBucket';
import Pagination from './Pagination';
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
        return this.$store.state.buckets.buckets || [];
      },
    },
    isLoading: {
      get() {
        return this.$store.state.buckets.isLoading;
      },
    },
    paginationPerPage: {
      get() {
        return this.$store.state.buckets.pagination.perPage;
      },
    },
    paginationCurrentPage: {
      get() {
        return this.$store.state.buckets.pagination.currentPage;
      },
      set(val) {
        this.$store.dispatch('buckets/CHANGE_PAGE', val);
        this.$store.dispatch('buckets/LOAD_BUCKETS');
      },
    },
    paginationTotalRows: {
      get() {
        return this.$store.state.buckets.pagination.totalRows;
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
    search() {
      if (this.q.length) {
        this.$store.dispatch('buckets/CHANGE_Q', this.q);
      } else {
        this.$store.dispatch('buckets/CHANGE_PAGE', 1);
      }
      this.$store.dispatch('buckets/LOAD_BUCKETS');
    },
    changeType(type) {
      this.$store.dispatch('buckets/CHANGE_TYPE', type);
      this.search();
    },
    changeOrder(orderBy) {
      this.$store.dispatch('buckets/CHANGE_ORDER_BY', orderBy);
      this.search();
    },
    applyFilter() {
      console.info('submit', this.type, this.selectedIds);
      this.$emit('submit-buckets', {
        type: this.type,
        ids: this.selectedIds,
      });
      this.selectedIds = [];
    },
  },
  mounted() {
    this.changeType(this.initialType);
  },
  components: {
    FilterFacetBucket,
    Pagination,
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
