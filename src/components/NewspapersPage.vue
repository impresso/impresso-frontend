<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="300px" class="border-right" variant="bg-light">
      <div slot="header" class="border-bottom border-tertiary bg-light">
        <b-tabs pills class="border-bottom mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item class="pl-2 active"
              active-class='none'
              :to="{ name:'newspapers'}"><span v-html="$t('label_list', { total: paginationList.totalRows})"/></b-nav-item>
          </template>
        </b-tabs>
        <div class="p-2 px-3">
          <input
            type="text"
            class="form-control"
            placeholder="... name or description "
            name=""
            value=""
            v-model.trim="query"/>
        </div>
      </div>
      <!-- body -->
      <div v-for="n in newspapers" class="border-bottom">
        <router-link
          class="px-3 py-2 d-block"
          v-bind:class="{active: n.uid === newspaperUid}"
          v-bind:to="{name: 'newspaper_metadata', params: {newspaper_uid: n.uid}}">
          <newspaper-item :item="n"/>
        </router-link>
      </div>
      <div class="my-5" />
      <!-- footer -->
      <div v-if="paginationList.totalRows > paginationList.perPage" slot="footer" class="fixed-pagination-footer aside p-1 m-0">
        <pagination
          v-bind:perPage="paginationList.perPage"
          v-bind:currentPage="paginationList.currentPage"
          v-bind:totalRows="paginationList.totalRows"
          v-on:change="onInputPaginationList"
          v-bind:showDescription="false"
          class="float-left small-caps" />
      </div>
    </i-layout-section>
    <router-view></router-view>
  </i-layout>
</template>

<script>
import Pagination from './modules/Pagination';
import NewspaperItem from './modules/lists/NewspaperItem';

export default {
  data: () => ({

  }),
  computed: {
    paginationList() {
      return this.$store.state.newspapers.list.pagination;
    },
    paginationDetail() {
      return this.$store.state.newspapers.detail.pagination;
    },
    newspapers() {
      return this.$store.state.newspapers.list.newspapers;
    },
    newspaperUid() {
      return this.$route.params.newspaper_uid;
    },
    query: {
      get() {
        return this.$store.state.newspapers.list.query || '';
      },
      set(val) {
        this.$store.commit('newspapers/UPDATE_LIST_QUERY', val);
        this.loadList(1);
      },
    },
    orderByOptions: {
      get() {
        return [
          {
            value: 'name',
            text: `${this.$t('sort_name')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-name',
            text: `${this.$t('sort_name')} ${this.$t('sort_desc')}`,
          },
          {
            value: 'startYear',
            text: `${this.$t('sort_start_date')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-startYear',
            text: `${this.$t('sort_start_date')} ${this.$t('sort_desc')}`,
          },
          {
            value: 'endYear',
            text: `${this.$t('sort_end_date')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-endYear',
            text: `${this.$t('sort_end_date')} ${this.$t('sort_desc')}`,
          },
        ];
      },
    },
    orderBy: {
      get() {
        return this.$store.state.newspapers.list.orderBy;
      },
      set(val) {
        this.$store.commit('newspapers/UPDATE_LIST_ORDER_BY', val);
        this.loadList(1);
      },
    },
  },
  methods: {
    loadList(page) {
      if (page !== undefined) {
        this.$store.commit('newspapers/UPDATE_LIST_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      return this.$store.dispatch('newspapers/LOAD_LIST');
    },
    onInputPaginationList(page = 1) {
      this.loadList(page);
    },
  },
  mounted() {
    this.loadList();
  },
  components: {
    Pagination,
    NewspaperItem,
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.active {
    background: $clr-accent-secondary;
}

.nav-item.active{
  background-color: transparent;
}
.newspaper-item h2{
  font-size: inherit;
}
</style>

<i18n>
{
  "en": {
    "label_list": "List of newspapers ({total})",
    "label_order": "Order By",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "sort_start_date": "Date of first issue",
    "sort_end_date": "Date of last issue",
    "sort_name": "Alphabetical"
  },
  "nl": {
    "label_order": "Sorteer Op",
    "sort_asc": "Oplopend",
    "sort_desc": "Aflopend",
    "sort_start_date": "Datum",
    "sort_end_date": "Datum",
    "sort_name": "Alfabetisch"
  }
}
</i18n>
