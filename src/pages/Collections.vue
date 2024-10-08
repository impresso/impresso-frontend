<template lang="html">
<i-layout>
  <i-layout-section width="350px" class="border-right">
    <template v-slot:header>
      <b-tabs pills class="mx-2 pt-2">
        <template v-slot:tabs-end>
          <b-nav-item class="pl-2 active"
            active-class='none'
            :to="getRouteWithSearchQuery({ name:'collections' })">
            {{ $tc('tabs.collections', paginationTotalRows, {total: $n(paginationTotalRows)}) }}</b-nav-item>
        </template>
      </b-tabs>
    </template>
    <template v-slot:default>
      <collection-list />
    </template>
  </i-layout-section>
  <router-view />
</i-layout>
</template>

<script>
import { mapStores } from 'pinia'
import CollectionList from '@/components/modules/CollectionList.vue';
import { useCollectionsStore } from '@/stores/collections'

export default {
  components: {
    CollectionList,
  },
  methods: {
    getRouteWithSearchQuery(route) {
      return {
        ...this.$route,
        ...route
      };
    },
  },
  computed: {
    ...mapStores(useCollectionsStore),
    paginationTotalRows: {
      get() {
        return this.collectionsStore.collectionsPaginationTotalRows
      },
    },
  },
};
</script>

<style scoped lang="less">
</style>

<i18n lang="json">
{
  "en": {
    "tabs": {
        "collections": "... collections | browse 1 collection | browse {total} collections"
    }
  }
}
</i18n>
