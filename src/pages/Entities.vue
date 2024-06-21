<template>
  <i-layout id="EntitiesPage">
    <list :pagination-list="paginationList" v-on:change-page="changePage">
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-start>
            <b-nav-item
              @click="switchTab(TabBrowseList)"
              :active="tab === TabBrowseList"
              active-class="active">
              <span v-html="$t('tabs.entities.browseList', {
                n: $n(paginationTotalRows)
              })" />
            </b-nav-item>
          </template>
          <template v-slot:default>
            <div class="p-2 px-3">
              <b-input placeholder="filter entities" v-model.trim="suggestionQuery"/>
              <div class="mt-2">
                <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
              </div>
            </div>
          </template>
          <!-- <b-nav-item :active="tab === TabObservingList" @click="switchTab(TabObservingList)">
            <template v-slot:title >
              <span v-html="$t('tabs.entities.observingList', { n: observedItemIds.length })"/>
            </template>
            <div class="p-3" v-if="!observedItemIds.length">
              <p class="text-center"><em>{{$t('label_observing_list_empty')}}</em></p>
            </div>
          </b-nav-item> -->
        </b-tabs>
        <div class="px-3 pb-3 pt-2" v-if="observedItemIds.length">
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
        <entity-item v-for="(entity, i) in tabItems"
            class="p-3 border-bottom"
            v-bind:key="i"
            v-bind:item="entity"
            v-bind:active="entity.uid === selectedId"
            show-link
            :observed="observedItemIds.includes(entity.uid)"
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
import List from '@/components/modules/lists/List.vue';
import EntityItem from '@/components/modules/lists/EntityItem.vue';
import { entities as entitiesService } from '@/services';
import { Navigation } from '@/plugins/Navigation';

const QueryParameters = Object.freeze({
  SelectedEntitiesIds: 'items',
})

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
    observedItems: [],
    isLoading: false,
  }),
  computed: {
    $navigation() {
      return new Navigation(this)
    },
    paginationList() {
      return {
        perPage: this.paginationPerPage,
        currentPage: this.paginationCurrentPage,
        totalRows: this.paginationTotalRows,
      };
    },
    observedItemIds: {
      /** @returns {string[]} */
      get() {
        try {
          // @ts-ignore
          const items = /** @type {string} */ (window.atob(this.$route.query[QueryParameters.SelectedEntitiesIds]))
          return items != null ? items.split(',') : []
        } catch (e) {
          return []
        }
      },
      /** @param {string[]} items */
      set(items) {
        this.$navigation.updateQueryParameters({
          // @ts-ignore
          [QueryParameters.SelectedEntitiesIds]: items.length > 0 ? window.btoa(items.join(',')) : undefined
        })
      },
    },
    tabItems() {
      return this.tab === TabObservingList ? this.observedItems : this.items;
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
      this.$router.push({
        name: 'entities',
        query: {
          ...this.$route.query,
          tab,
        },
      })
    },
    handleToggleObserved(item) {
      if (this.observedItemIds.includes(item.uid)) {
        this.observedItemIds = this.observedItemIds.filter(uid => uid !== item.uid);
      } else {
        this.observedItemIds = this.observedItemIds.concat(item.uid);
      }
    },
    resetObservedItems() {
      this.observedItemIds = [];
    },
    changePage(page = 1) {
      this.paginationCurrentPage = page;
    },
  },
  watch: {
    observedItemIds: {
      handler(itemIds, previousItemsIds = []) {
        if (!itemIds.length) {
          this.observedItems = [];
        } else if (itemIds.join('-') !== previousItemsIds.join('-')) {
          // load items only if the list changed. That's a weird behaviour.
          entitiesService.find({
            query: {
              filters: [{
                type: 'uid',
                q: itemIds,
              }],
            },
          }).then(({ data }) => {
            this.observedItems = data.map(d => new Entity(d));
          });
        }
      },
      immediate:true,
    },
    serviceQuery: {
      async handler(params, oldParams) {
        const newParamsStr = JSON.stringify(params)
        const oldParamsStr = JSON.stringify(oldParams)
        if (newParamsStr === oldParamsStr) {
          // Params are the same: ${newParamsStr} ${oldParamsStr}`)
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
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

a.d-block:hover {
  text-decoration: none;
}
a.d-block.active {
    background: $clr-accent-secondary;
}
</style>

<i18n lang="json">
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
    "label_observing_list_empty": "This panel will contain the list of visualized entities."
  }
}
</i18n>
