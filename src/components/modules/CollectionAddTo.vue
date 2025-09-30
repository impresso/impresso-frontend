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
    <collection-add-to-list v-else :items="items" />
  </b-dropdown>
</template>

<script setup lang="ts">
import { useCollectionsStore } from '@/stores/collections'
import { useUserStore } from '@/stores/user'
import CollectionAddToList, { ItemWithCollections } from './CollectionAddToList.vue'

export interface Props {
  items: ItemWithCollections[]
  text?: string
}
const { items, text } = defineProps<Props>()

const collectionsStore = useCollectionsStore()
const userStore = useUserStore()

const fetch = () => {
  if (isLoggedIn()) {
    return collectionsStore.loadCollections()
  }
  return {}
}
const isLoggedIn = () => {
  return userStore.userData
}
</script>
