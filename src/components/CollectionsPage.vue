<template lang="html">
<i-layout id="UserCollectionPage">
  <i-layout-section width="400px" class="border-right">
    <template v-slot:header>
      <b-tabs pills class="mx-2 pt-2">
        <template v-slot:tabs-end>
          <b-nav-item class="pl-2 active"
            active-class='none'
            :to="{ name:'collections'}">{{ $t('tabs.collections', {total: $n(filteredCollections)}) }}</b-nav-item>
        </template>
      </b-tabs>
    </template>
    <template v-slot:default>
      <collection-list @total-change="handleTotal" />
    </template>
  </i-layout-section>
  <i-layout-section>
    <router-view />
  </i-layout-section>
</i-layout>
</template>

<script>
import CollectionList from './modules/CollectionList';

export default {
  components: {
    CollectionList,
  },
  data: () => ({
    collection: {},
    filteredCollections: 100,
  }),
  computed: {
    user() {
      return this.$store.getters['user/user'];
    },
  },
  mounted() {
  },
  methods: {
    handleTotal(e) {
      this.filteredCollections = e;
    },
  },
};
</script>

<style scoped lang="less">
</style>

<i18n>
{
  "en": {
    "collections": "collections",
    "tabs": {
        "collections": "My Collections ({total})"
    }
  }
}
</i18n>
