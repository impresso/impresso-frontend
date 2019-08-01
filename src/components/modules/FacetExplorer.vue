<template lang="html">
  <div>
    <form v-on:submit.prevent="search()" class="mb-3">
      <b-input-group>
        <b-form-input
        placeholder="search for ..."
        v-model.trim="q"
        />
        <b-input-group-append>
          <b-form-select name="orderBy"
            v-model="orderBy"
            :options="orderByOptions"
            @change="search()"
            size="md" variant="outline-primary" />
          <b-btn class="pt-2 pb-1 px-2"
            variant="outline-primary"
            v-on:click="search">
            <div class="search-submit dripicons-search"></div>
          </b-btn>
        </b-input-group-append>
      </b-input-group>
    </form>
    <!-- {{ selectedIds }} -->
    <!-- The Loop -->
    <b-form-checkbox-group v-model="selectedIds">
      <b-form-checkbox v-for="bucket in buckets.items" :value="bucket.val" class="d-block">
        <div v-if="facetType === 'topic'">
            {{bucket.item.model}} [{{bucket.item.language}}]
            <div v-if="bucket.item.words && bucket.item.words.length > 0">
              <span
                v-for="word in bucket.item.words"
                v-if="word.p > 0.008"
                class="small-caps"
                :style="`opacity: ${25 * word.p}`">{{word.w}} &middot; </span>
            </div>
            <div v-if="bucket.item.matches" v-html="bucket.item.matches[0]" class="small" />
          </div>
        <div v-else>
          {{bucket.item.name}} ({{bucket.count}}, {{bucket.countItems}})
        </div>
      </b-form-checkbox>
    </b-form-checkbox-group>
    <b-button @click="applyFilter()" class="w-100 my-2 btn btn-sm btn-outline-primary">Apply</b-button>
    <pagination
      size="sm"
      v-if="paginationTotalRows > paginationPerPage"
      v-bind:perPage="paginationPerPage"
      v-bind:currentPage="paginationCurrentPage"
      v-bind:totalRows="paginationTotalRows"
      v-on:change="getBuckets"
      class="float-left small-caps mt-3" />
  </div>
</template>

<script>
import FilterFacetBucket from './FilterFacetBucket';
import Pagination from './Pagination';

export default {
  data: () => ({
    selectedIds: [],
    selectedItems: [],
    operators: ['or', 'and'],
    q: '',
    orderBy: 'name',
  }),
  props: {
    store: {
      type: String,
      default: 'search',
    },
    facet: {
      type: Object,
    },
    facetType: {
      type: String,
      default: 'person',
    },
  },
  computed: {
    buckets: {
      get() {
        return this.$store.state.buckets;
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
        this.$store.commit('buckets/UPDATE_PAGINATION_CURRENT_PAGE', val);
      },
    },
    paginationTotalRows: {
      get() {
        return this.$store.state.buckets.pagination.totalRows;
      },
    },
    orderByOptions: {
      get() {
        switch (this.facetType) {
          case 'topic' :
            return [
              { value: 'name', text: 'Name' },
              { value: '-name', text: '-Name' },
              { value: 'model', text: 'model' },
              { value: '-model', text: '-model' },
            ];
          default:
            return [
              { value: 'name', text: 'Name' },
              { value: 'count', text: 'Count' },
              { value: 'count-mentions', text: 'Count Mentions' },
            ];
        }
      },
    },
  },
  methods: {
    getBuckets(page = 1) {
      this.paginationCurrentPage = page;

      this.$store.dispatch('buckets/LOAD_BUCKETS', {
        facet: this.facetType,
        q: this.q,
        orderBy: this.orderBy,
      }).then(() => {
        // this.buckets.items.forEach((bucket) => {
        //   bucket.checked = this.selectedIds.includes(bucket.val);
        // });
        // this.$forceUpdate();
      });
    },
    search() {
      this.$store.dispatch('buckets/LOAD_BUCKETS', {
        facet: this.facetType,
        q: this.q,
        orderBy: this.orderBy,
      });
    },
    applyFilter() {
      console.log('submit', this.facetType, this.selectedIds);
      this.$emit('submit-buckets', {
        type: this.facetType,
        ids: this.selectedIds,
      });
      this.clearSelectedItems();
    },
    updateFilter(filter) {
      this.$emit('update-filter', filter);
    },
    resetFilterType() {
      this.clearSelectedItems();
      this.$emit('reset-filter', this.facetType);
    },
  },
  mounted() {
    this.getBuckets(1);
  },
  components: {
    FilterFacetBucket,
    Pagination,
  },
};
</script>

<style scoped lang="less">
</style>
<i18n>
{
  "en": {
  }
}
</i18n>
