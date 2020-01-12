<template lang="html">
  <i-layout>
    <list :pagination-list="paginationList" v-on:change-page="changePage">
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item class="pl-2 active"
              active-class='none'
              :to="{ name:'newspapers'}"><span v-html="$t('label_list', { total: $n(paginationList.totalRows) })"/></b-nav-item>
          </template>
        </b-tabs>
        <div class="p-2 px-3">
          <b-input placeholder="filter newspapers" v-model.trim="query"/>
          <div class="mt-2">
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </div>
        </div>
      </template>
      <template v-slot:default>
        <router-link v-for="(newspaper, i) in newspapers" v-bind:key="i"
          class="p-3 border-bottom d-block"
          v-bind:class="{active: newspaper.uid === newspaperUid}"
          v-bind:to="{name: 'newspaper_metadata', params: {newspaper_uid: newspaper.uid}}">
          <newspaper-item :item="newspaper"/>
        </router-link>
      </template>
    </list>
    <router-view></router-view>
  </i-layout>
</template>

<script>
import List from './modules/lists/List';
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
          {
            value: 'countIssues',
            text: `${this.$t('sort_count_issues')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-countIssues',
            text: `${this.$t('sort_count_issues')} ${this.$t('sort_desc')}`,
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
    changePage(page = 1) {
      this.loadList(page);
    },
    loadList(page) {
      if (page !== undefined) {
        this.$store.commit('newspapers/UPDATE_LIST_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      return this.$store.dispatch('newspapers/LOAD_LIST');
    },
  },
  mounted() {
    this.loadList();
  },
  components: {
    List,
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
    "filter_newspapers": "filter newspapers ({total})",
    "label_list": "list of newspapers ({total})",
    "label_order": "Order By",
    "sort_asc": "↑",
    "sort_desc": "↓",
    "sort_start_date": "Date of first issue",
    "sort_end_date": "Date of last issue",
    "sort_name": "Alphabetical",
    "sort_count_issues": "Available # of Issues"
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
