<template lang="html">
  <i-layout id="EntitiesPage">
    <i-layout-section width="300px" class="border-right">
      <div slot="header" class="border-bottom border-tertiary bg-light">
        <b-tabs pills class="border-bottom mx-2 pt-2">
          <template slot="tabs">
            <b-nav-item class="pl-2 active"
              active-class='none'
              :to="{ name:'entities'}"><span v-html="$t('label_list', { total: paginationList.totalRows})"/></b-nav-item>
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
          <div class="mt-2">
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </div>
        </div>

      </div>

      <div v-for="entity in entities" class="border-bottom">
        <router-link
          class="px-2 py-2 d-block clearfix"
          v-bind:class="{active: entity.uid === entityId}"
          v-bind:to="{name: 'entity', params: {entity_id: entity.uid}}">
          <div
            class="mb-2 mr-3 float-left"
            v-if="entity.wikidata.images.length">
            <img :src="getWikidataImageURL(entity.wikidata.images[0], { width: 60})">
          </div>
          <strong>{{ getEntityName(entity) }}</strong>
          <br>
          <p v-if="entity.wikidata.descriptions">
            {{ entity.wikidata.descriptions.en }}
          </p>
          <div class="small-caps" v-if="entity.countItems > -1">
            Items: {{ entity.countItems }} — Mentions: {{ entity.countMentions }}
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
    getWikidataImageURL(image, { width = 60 } = {}) {
      return `http://commons.wikimedia.org/wiki/Special:FilePath/${image.value}?width=${width}px`;
    },
    getEntityName(entity) {
      if (!entity.name) {
        return this.$t('result.label.entity.untitled');
      }
      return entity.name.split('_').join(' ');
    },
  },
  async mounted() {
    await this.loadList();
  },
  computed: {
    entityId() {
      return this.$route.params.entity_id;
    },
    entities() {
      return this.$store.state.entities.items;
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
        this.loadList();
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
        this.loadList();
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
