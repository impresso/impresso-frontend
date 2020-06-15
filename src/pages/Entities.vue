<template lang="html">
  <i-layout id="EntitiesPage">
    <list :pagination-list="paginationList" v-on:change-page="changePage">
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <b-tab :active="tab === TabBrowseList" @click="switchTab(TabBrowseList)">
            <template v-slot:title>
              <span v-html="$t('tabs.entities.browseList', {
                n: $n(paginationTotalRows)
              })"/>
            </template>
            <div class="p-2 px-3">
              <b-input placeholder="filter entities" v-model.trim="suggestionQuery"/>
              <div class="mt-2">
                <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
              </div>
            </div>
          </b-tab>
          <b-tab :active="tab === TabObservingList" @click="switchTab(TabObservingList)">
            <template v-slot:title >
              <span v-html="$t('tabs.entities.observingList', { n: observedItems.length })"/>
            </template>
            <div class="p-3" v-if="!observedItems.length">
              <p class="text-center"><em>{{$t('label_observing_list_empty')}}</em></p>
            </div>
          </b-tab>
        </b-tabs>
        <div class="px-3 pb-3 pt-2" v-if="observedItems.length">
          <b-button size="sm" class="ml-2" variant="outline-primary" @click="resetObservedItems">
            {{ $t('actions.resetObservedItems') }}
          </b-button>
        </div>
      </template>
      <template v-slot:default>
        <div class="p-4 text-center" v-if="!isLoading && !items.length">
          {{ $t('notFound') }}
        </div>
        <div class="p-4 text-center" v-else-if="isLoading">
          {{ $t('actions.loading')}}
        </div>
        <entity-item v-for="(entity, i) in items"
          class="p-3 border-bottom"
          v-bind:key="i"
          v-bind:item="entity"
          v-bind:active="entity.uid === selectedId"
          show-link
          is-observable
          :observed="observedItems.includes(entity.uid)"
          @toggle-observed="handleToggleObserved"
        />
      </template>
    </list>
    <!-- main page -->
    <router-view />
  </i-layout>
</template>

<script>
import Entity from '@/models/Entity';
import List from '@/components/modules/lists/List';
import EntityItem from '@/components/modules/lists/EntityItem';
import { entities as entitiesService } from '@/services';

const TabObservingList = 'obs';
const TabBrowseList = 'list';
const OrderByOptions = [
  'name', '-name',
  'count', '-count',
  'count-mentions', '-count-mentions'
];
const OrderByDefault = '-count';

export default {
  data: () => ({
    TabObservingList,
    TabBrowseList,
    paginationPerPage: 20,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    items: [],
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
    observedItems: {
      get() {
        return this.$route.query.items ?? [];
      },
      set(items) {
        this.$navigation.updateQueryParametersWithHistory({
          items,
        });
      },
    },
    tab: {
      get() {
        return [
          TabObservingList,
          TabBrowseList,
        ].includes(this.$route.query.tab)
          ? this.$route.query.tab
          : TabBrowseList;
      },
      set(tab) {
        this.$navigation.updateQueryParameters({
          tab,
        });
      },
    },
    serviceQuery: {
      get() {
        return {
          q: this.suggestionQuery,
          limit: this.paginationPerPage,
          page: this.paginationCurrentPage,
          orderBy: this.orderBy,
        };
      },
    },
    selectedId() {
      return this.$route.params.entity_id;
    },
    orderByOptions() {
      return OrderByOptions.map(value => ({
        value,
        text: this.$t(`sort_${value}`),
      }))
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
  },
  methods: {
    switchTab(tab) {
      this.$navigation.updateQueryParametersWithHistory({
        tab,
      });
    },
    handleToggleObserved(item) {
      if (this.observedItems.includes(item.uid)) {
        this.observedItems = this.observedItems.filter(uid => uid !== item.uid);
      } else {
        this.observedItems = this.observedItems.concat(item.uid);
      }
    },
    resetObservedItems() {
      this.observedItems = [];
    },
    changePage(page = 1) {
      this.paginationCurrentPage = page;
    },
  },
  watch: {
    serviceQuery: {
      async handler(params, oldParams) {
        const newParamsStr = JSON.stringify(params)
        const oldParamsStr = JSON.stringify(oldParams)
        if (newParamsStr === oldParamsStr) {
          console.warn(`Params are the same: ${newParamsStr} ${oldParamsStr}`)
          return;
        }
        const { q, limit, page, orderBy } = params;
        if (this.isLoading) {
          console.warn('loading already... please try again later on');
          return;
        }
        this.isLoading = true;
        const query = {
          page,
          limit,
          order_by: orderBy,
        };
        if (q.length) {
          query.q = q.split('*').concat(['*']).join('');
        }
        this.items = [];
        return entitiesService.find({
          query,
        }).then(({ data, total }) => {
          this.paginationTotalRows = total;
          this.items = data.map(d => new Entity(d));
          this.isLoading = false;
        });
      },
      deep: true,
      immediate:true,
    }
  },
  components: {
    List,
    EntityItem,
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

a.d-block:hover {
  text-decoration: none;
}
a.d-block.active {
    background: $clr-accent-secondary;
}
</style>

<i18n>
{
  "en": {
    "label_order": "Order By",
    "sort_name": "by name, A-Z",
    "sort_-name": "by name, Z-A",
    "sort_count": "least articles",
    "sort_-count": "most mentioned in different articles",
    "sort_count": "least mentioned in different articles",
    "sort_-count-mentions": "most mentioned",
    "sort_count-mentions": "least mentioned",
    "label_observing_list_empty": "This panel will contain the list of visualized topics."
  }
}
</i18n>
