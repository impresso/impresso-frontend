<template lang="html">
  <div>
    <b-dropdown size="sm" variant="outline-primary">
      <template slot="button-content">
        <span v-html="$t(`switchTypes.${type}`)"/>
      </template>
      <b-dropdown-item
        v-for="option in typeOptions"
        v-bind:active="type === option"
        v-bind:key="option"
        v-on:click="changeType(option)"
      ><span class="small" v-html="$t(`switchTypes.${option}`)"></span></b-dropdown-item>
    </b-dropdown>
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
    <span v-if='isLoading'>{{ $t('loading') }}</span>
    <!-- The Loop -->
    <b-form-checkbox-group v-model="selectedIds">
      <b-form-checkbox v-for="bucket in buckets" :value="bucket.val" class="d-block">
        <item-label v-if="bucket.item" :item="bucket.item" :type="type" />
        <span v-if="bucket.count > -1">( {{ $n(bucket.count) }} )</span>
      </b-form-checkbox>
    </b-form-checkbox-group>
    <!-- Apply! -->
    <b-button v-if='selectedIds.length' @click="applyFilter()" class="w-100 my-2 btn btn-sm btn-outline-primary"
      v-html="$tc('actions.addToCurrentFiltersDetailed', selectedIds.length)"></b-button>
    <!--  Pagination -->
    <pagination
      size="sm"
      v-if="paginationTotalRows > paginationPerPage"
      v-model="paginationCurrentPage"
      :perPage="paginationPerPage"
      :totalRows="paginationTotalRows"
      class="float-left small-caps mt-3" />
  </div>
</template>

<script>
import FilterFacetBucket from './FilterFacetBucket';
import Pagination from './Pagination';
import ItemLabel from './lists/ItemLabel';

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
      },
    },
    paginationTotalRows: {
      get() {
        return this.$store.state.buckets.pagination.totalRows;
      },
    },
    orderByOptions: {
      get() {
        switch (this.type) {
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
    search() {
      this.$store.dispatch('buckets/CHANGE_PAGE', 1);
    },
    changeType(type) {
      this.$store.dispatch('buckets/CHANGE_TYPE', type);
    },
    applyFilter() {
      console.log('submit', this.type, this.selectedIds);
      this.$emit('submit-buckets', {
        type: this.type,
        ids: this.selectedIds,
      });
      this.clearSelectedItems();
    },
    updateFilter(filter) {
      this.$emit('update-filter', filter);
    },
    resetFilterType() {
      this.clearSelectedItems();
      this.$emit('reset-filter', this.type);
    },
  },
  mounted() {
    this.changeType(this.initialType);
  },
  components: {
    FilterFacetBucket,
    Pagination,
    ItemLabel,
  },
};
</script>

<style scoped lang="less">
</style>
<i18n>
{
  "en": {
    "switchTypes": {
      "collection": "all collections",
      "country": "all publication countries",
      "language": "all languages",
      "location": "all locations mentioned",
      "person": "all people mentioned",
      "topic": "all topics computed"
    }
  }
}
</i18n>
