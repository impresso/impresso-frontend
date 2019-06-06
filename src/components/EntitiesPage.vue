<template lang="html">
  <i-layout id="EntitiesPage">
    <i-layout-section width="300px" class="border-right">
      <!-- <pre>
        {{entities}}
      </pre> -->

      <div slot="header" class="border-bottom">

        <div class="p-3 bg-light">
          <p>{{$t("label_list", { total: paginationList.totalRows})}}</p>
          <label class="mr-1">{{$t("label_order")}}</label>
          <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
        </div>
        <div class="px-2 pb-2 bg-light">
          <input
            type="text"
            class="form-control"
            placeholder="Filter by name"
            name=""
            value=""
            v-model.trim="query"/>
        </div>
      </div>

      <div v-for="e in entities.entities" class="border-bottom">
        <router-link
          class="px-3 py-2 d-block"
          v-bind:class="{active: e.id === entityId}"
          v-bind:to="{name: 'entity', params: {entity_id: e.id}}">
          <strong>{{e.name}}</strong>
          <br>
          <p v-if="e.wikidata.descriptions">
            {{ e.wikidata.descriptions.en }}
          </p>
          <div class="small-caps">
            Items: {{ e.countItems }} — Mentions: {{ e.countMentions }}
          </div>
        </router-link>
      </div>

      <div
        v-if="paginationList.totalRows > paginationList.perPage"
        slot="footer"
        class="p-2 border-top">
        <pagination
          v-bind:perPage="paginationList.perPage"
          v-bind:currentPage="paginationList.currentPage"
          v-bind:totalRows="paginationList.totalRows"
          v-on:change="onInputPaginationList"
          class="small-caps"
          v-bind:showDescription="false" />
      </div>
    </i-layout-section>

    <router-view />

  </i-layout>
</template>

<script>
import Pagination from './modules/Pagination';

export default {
  methods: {
    loadList(page) {
      if (page !== undefined) {
        this.$store.commit('entities/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      return this.$store.dispatch('entities/LOAD_ENTITIES');
    },
    onInputPaginationList(page = 1) {
      this.loadList(page);
    },
  },
  mounted() {
    this.loadList().then(() => {
      // console.log(res);
    });
  },
  computed: {
    entityId() {
      return this.$route.params.entity_id;
    },
    entities() {
      return this.$store.state.entities;
    },
    paginationList() {
      return this.$store.state.entities.pagination;
    },
    query: {
      get() {
        return this.$store.state.entities.query || '';
      },
      set(val) {
        this.$store.commit('entities/UPDATE_QUERY', val);
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
        ];
      },
    },
    orderBy: {
      get() {
        return this.$store.state.entities.orderBy;
      },
      set(val) {
        this.$store.commit('entities/UPDATE_ORDER_BY', val);
        this.loadList(1);
      },
    },
  },
  components: {
    Pagination,
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
    "label_list": "List of entities ({total})",
    "label_order": "Order By",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "sort_name": "Alphabetical"
  }
}
</i18n>
