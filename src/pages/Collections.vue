<template lang="html">
<i-layout>
  <i-layout-section width="350px" class="border-right">
    <template v-slot:header>
      <b-tabs pills class="mx-2 pt-2">
        <template v-slot:tabs-end>
          <b-nav-item class="pl-2 active"
            active-class='none'
            :to="{ name:'collections' }">{{ $t('tabs.collections', {total: $n(totalItems)}) }}</b-nav-item>
        </template>
      </b-tabs>
    </template>
    <template v-slot:default>
      <collection-list @total-change="handleTotal" />
    </template>
  </i-layout-section>
  <router-view />
</i-layout>
</template>

<script>
import CollectionList from '@/components/modules/CollectionList';

export default {
  components: {
    CollectionList,
  },
  data: () => ({
    totalItems: 100,
  }),
  methods: {
    handleTotal(total) {
      this.totalItems = total;
    },
  },
};
</script>

<style scoped lang="less">
</style>

<i18n>
{
  "en": {
    "tabs": {
        "collections": "browse {total} collections"
    }
  }
}
</i18n>
