<template lang="html">
  <i-layout>
    <list :pagination-list="paginationList" v-on:change-page="changePage">
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item class="pl-2 active"
              active-class='none'
              :to="{ name:'newspapers'}"><span v-html="$t('label_list', { total: $n(paginationTotalRows) })"/></b-nav-item>
          </template>
        </b-tabs>
        <div class="pb-2 px-3">
          <b-input class="my-3" v-model.trim="suggestionQuery"
            debounce="150" :placeholder="$t('filter_newspapers')" />
          <div class="my-2">
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </div>
        </div>
      </template>
      <template v-slot:default>
        <newspaper-item v-for="(newspaper, i) in items"
          class="p-3 border-bottom"
          :key="i"
          :item="newspaper"
          :active="newspaper.uid === newspaperUid"
          show-link
        />
      </template>
    </list>
    <router-view :newspapers="items"></router-view>
  </i-layout>
</template>

<script>
import Newspaper from '@/models/Newspaper'
import List from '@/components/modules/lists/List';
import NewspaperItem from '@/components/modules/lists/NewspaperItem';
import { newspapers as newspapersService} from '@/services';

const OrderByOptions = [
  'name', '-name', 'startYear', '-startYear',
  'endYear', '-endYear', 'countIssues', '-countIssues'
];
const OrderByDefault = '-countIssues';

export default {
  data: () => ({
    paginationPerPage: 200,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    items: [],
    observedItems: [],
    isLoading: false,
  }),
  computed: {
    paginationList() {
      return {
        perPage: this.paginationPerPage,
        currentPage: this.paginationCurrentPage,
        totalRows: this.paginationTotalRows,
      };
    },
    newspaperUid() {
      return this.$route.params.newspaper_uid;
    },
    suggestionQuery: {
      get() {
        return this.$route.query.q ?? '';
      },
      set(q) {
        this.paginationCurrentPage = 1;
        this.$navigation.updateQueryParametersWithHistory({
          q,
        });
      },
    },
    orderByOptions() {
      return OrderByOptions.map(value => ({
        value,
        text: this.$t(`sort_${value}`),
      }));
    },
    orderBy: {
      get() {
        return OrderByOptions.includes(this.$route.query.orderBy)
          ? this.$route.query.orderBy
          : OrderByDefault;
      },
      set(orderBy) {
        this.$navigation.updateQueryParametersWithHistory({
          orderBy,
        });
      },
    },
    serviceQuery() {
      return {
        q: this.suggestionQuery,
        limit: this.paginationPerPage,
        page: this.paginationCurrentPage,
        orderBy: this.orderBy,
      };
    },
  },
  methods: {
    changePage(page = 1) {
      this.paginationCurrentPage = page;
    },
  },
  watch: {
    serviceQuery: {
      handler(params, oldParams) {
        // this get called twice becaues of the suggestionQuery
        const newParamsStr = JSON.stringify(params)
        const oldParamsStr = JSON.stringify(oldParams)
        if (newParamsStr === oldParamsStr) {
          // Params are the same: ${newParamsStr} ${oldParamsStr}`)
          return;
        }
        const { q, limit, page, orderBy } = params;
        const query = {
          page,
          limit,
          order_by: orderBy,
        };
        if (q.length) {
          // add q only if length is enough
          query.q = q;
        }
        this.items = [];
        return newspapersService.find({
          query,
        }).then(({ data, total }) => {
          this.paginationTotalRows = total;
          this.items = data.map(d => new Newspaper(d));
        });
      },
      immediate: true,
    },
  },
  components: {
    List,
    NewspaperItem,
  }
}
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

</style>

<i18n>
{
  "en": {
    "filter_newspapers": "filter list of newspapers by name ...",
    "label_list": "browse {total} newspapers",
    "label_order": "Order By",
    "sort_name": "order alphabetically, A-Z ↑",
    "sort_-name": "order alphabetical, Z-A ↓",
    "sort_startYear": "order by date of first issue ↑",
    "sort_-startYear": "order by date of first issue ↓",
    "sort_endYear": "order by date of last issue ↑",
    "sort_-endYear": "order by date of last issue ↓",
    "sort_countIssues": "order by number of available issues ↑",
    "sort_-countIssues": "order by number of available issues ↓"
  }
}
</i18n>
