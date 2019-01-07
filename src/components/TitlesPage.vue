<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="400px" class="border-right">
      <div slot="header" class="border-bottom">
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="px-3 py-3">
            <label class="mr-1">{{$t("label_order")}}</label>
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </b-navbar-nav>
        </b-navbar>
        <div class="p-2">
          <input
            type="text"
            class="form-control"
            placeholder="Search"
            name=""
            value=""
            v-model="query"
            v-on:keyup.enter="loadTitles(1)" />
        </div>

      </div>
      <div class="py-4">
        <div v-for="title in titles" class="border-bottom">
          <router-link class="p-2 d-block" v-bind:to="{name: 'titles', params: {title_uid: title.uid}}">
            {{title.name}} ({{title.startYear}} - {{title.endYear}})
          </router-link>
        </div>
      </div>
      <div slot="footer" class="p-2 border-top">
        <pagination
          v-bind:perPage="pagination.perPage"
          v-bind:currentPage="pagination.currentPage"
          v-bind:totalRows="pagination.totalRows"
          v-on:change="onInputPagination"
          v-bind:showDescription="true" />
      </div>
    </i-layout-section>
    <i-layout-section>
      <b-navbar type="light" variant="light" class="border-bottom">
        some results summary
      </b-navbar>
      <div class="p-4">
        {{title}}
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import Pagination from './modules/Pagination';

export default {
  data: () => ({
  }),
  computed: {
    pagination() {
      return this.$store.state.titles.pagination;
    },
    titles() {
      return this.$store.state.titles.titles;
    },
    title() {
      return this.$store.state.titles.title;
    },
    query: {
      get() {
        return this.$store.state.titles.query;
      },
      set(val) {
        this.$store.commit('titles/UPDATE_QUERY', val);
      },
    },
    orderByOptions: {
      get() {
        return [
          {
            value: 'alphabetical',
            text: `${this.$t('sort_alphabetical')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-alphabetical',
            text: `${this.$t('sort_alphabetical')} ${this.$t('sort_desc')}`,
          },
          {
            value: 'date',
            text: `${this.$t('sort_date')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-date',
            text: `${this.$t('sort_date')} ${this.$t('sort_desc')}`,
          },
        ];
      },
    },
    orderBy: {
      get() {
        // return 'date';
        return this.$store.state.titles.orderBy;
      },
      set(val) {
        this.$store.commit('titles/UPDATE_ORDER_BY', val);
        this.loadTitles(1);
      },
    },
  },
  methods: {
    loadTitles(page) {
      if (page !== undefined) {
        this.$store.commit('titles/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }

      this.$store.dispatch('titles/LOAD_TITLES');
    },
    loadTitle(titleUid) {
      this.$store.dispatch('titles/LOAD_TITLE', titleUid);
    },
    onInputPagination(page = 1) {
      this.loadTitles(page);
    },
  },
  mounted() {
    this.loadTitles();
  },
  components: {
    Pagination,
  },
  watch: {
    '$route.params.title_uid': {
      immediate: true,
      handler(titleUid) {
        this.loadTitle(titleUid);
      },
    },
  },
};
</script>

<style lang="less">
</style>

<i18n>
{
  "en": {
    "label_order": "Order By",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "sort_date": "Date",
    "sort_alphabetical": "Alphabetical"
  },
  "nl": {
    "label_order": "Sorteer Op",
    "sort_asc": "Oplopend",
    "sort_desc": "Aflopend",
    "sort_date": "Datum",
    "sort_alphabetical": "Alfabetisch"
  }
}
</i18n>
