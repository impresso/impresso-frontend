<template lang="html">
<i-layout id="UserCollectionPage">
  <i-layout-section width="400px" class="border-right">
    <div slot="header" class="pt-1 bg-light">
      <base-tabs v-model="tab" class="pl-3" v-bind:tabs="tabs"></base-tabs>
    </div>
    <collection-list v-show="tab.name === 'collections'" v-model="collection"/>
  </i-layout-section>

  <router-view/>

</i-layout>
</template>

<script>
import BaseTabs from './base/BaseTabs';
import CollectionList from './modules/CollectionList';

export default {
  components: {
    BaseTabs,
    CollectionList,
  },
  data: () => ({
    tab: {},
    collection: {},
  }),
  computed: {
    tabs() {
      return [
        {
          label: this.$t('tabs.collections'),
          name: 'collections',
          active: true,
        },
        {
          label: this.$t('tabs.searches'),
          name: 'searches',
          disabled: true,
        },
        {
          label: this.$t('tabs.labels'),
          name: 'labels',
          disabled: true,
        },
      ];
    },
    user() {
      return this.$store.getters['user/user'];
    },
  },
  mounted() {
    this.$store.commit('SET_HEADER_TITLE', {
      subtitle: this.$t('collections'),
      title: `@${this.user.username}`,
    });
  },
  methods: {
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
        "collections": "My Collections",
        "searches": "My Searches",
        "labels": "My Labels"
    }
  }
}
</i18n>
