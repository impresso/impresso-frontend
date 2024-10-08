<template>
  <b-dropdown
    size="sm"
    variant="outline-primary"
    class="position-relative"
    v-on:shown="fetch"
    v-bind:text="text"
  >
    <div v-if="!isLoggedIn()" class="p-2 bg-light">
      <b-button
        size="sm"
        class="w-100"
        variant="outline-primary"
        @click="$router.push({ name: 'login' })"
      >
        {{ $t('login') }}
      </b-button>
    </div>
    <collection-add-to-list v-else :item="item" :items="items" />
  </b-dropdown>
</template>

<script>
import { mapStores } from 'pinia'
import CollectionAddToList from './CollectionAddToList.vue';
import { useCollectionsStore } from '@/stores/collections'
import { useUserStore } from '@/stores/user'

export default {
  data: () => ({
    show: false,
  }),
  props: {
    text: String,
    item: Object,
    items: Array,
  },
  components: {
    CollectionAddToList,
  },
  methods: {
    fetch() {
      if (this.isLoggedIn()) {
        return this.collectionsStore.loadCollections()
      }
      return {}
    },
    isLoggedIn() {
      return this.userStore.userData
    },
  },
  computed: {
    ...mapStores(useCollectionsStore, useUserStore),
  },
};
</script>
