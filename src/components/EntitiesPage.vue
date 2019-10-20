<template lang="html">
  <i-layout id="EntitiesPage">
    <list :pagination-list="paginationList" v-on:change-page="changePage">
      <template v-slot:header>
        <b-tabs pills class="border-bottom mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item class="pl-2 active"
              active-class='none'
              :to="{ name:'entities'}"><span v-html="$t('label_list', { total: $n(paginationList.totalRows) })"/></b-nav-item>
          </template>
        </b-tabs>
        <div class="p-2 px-3">
          <b-input placeholder="filter entities" v-model.trim="query"/>
          <div class="mt-2">
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </div>
        </div>
      </template>
      <template v-slot:default>
        <entity-item v-for="(entity, i) in entities"
          class="p-3 border-bottom"
          v-bind:key="i"
          v-bind:item="entity"
          v-bind:active="entity.uid === selectedId"
          show-link
        />
      </template>
    </list>
    <!-- main page -->
    <router-view />

  </i-layout>
</template>

<script>
import List from './modules/lists/List';
import EntityItem from './modules/lists/EntityItem';

export default {
  methods: {
    loadList(page) {
      return this.$store.dispatch('entities/LOAD_ENTITIES', {
        page,
        q: this.query,
      });
    },
    changePage(page = 1) {
      debugger;
      this.loadList(page);
    },
  },
  mounted() {
    return this.loadList();
  },
  computed: {
    selectedId() {
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
    orderByOptions() {
      return [
        {
          value: 'name',
          text: this.$t('sort.name.asc'),
        },
        {
          value: '-name',
          text: this.$t('sort.name.desc'),
        },
        {
          value: '-count',
          text: this.$t('sort.countArticles.desc'),
        },
        {
          value: 'count',
          text: this.$t('sort.countArticles.asc'),
        },
        {
          value: '-count-mentions',
          text: this.$t('sort.countMentions.desc'),
        },
        {
          value: 'count-mentions',
          text: this.$t('sort.countMentions.asc'),
        },
      ];
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
    "label_list": "browse {total} named entities",
    "label_order": "Order By",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "sort_name": "Alphabetical"
  }
}
</i18n>
