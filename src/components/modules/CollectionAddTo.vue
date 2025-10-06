<template>
  <b-dropdown
    size="sm"
    variant="outline-primary"
    class="position-relative"
    @shown="() => (isVisible = true)"
    @hidden="() => (isVisible = false)"
    :text="text"
    :initialIsOpen="initialIsOpen"
    :right="right"
  >
    <div v-if="!isLoggedIn" class="p-2 bg-light">
      <b-button
        size="sm"
        class="w-100"
        variant="outline-primary"
        @click="$router.push({ name: 'login' })"
      >
        {{ $t('login') }}
      </b-button>
    </div>
    <CollectionAddToList
      v-else
      :items="items"
      :is-visible="isVisible"
      @change="payload => collectionAddToListChangeHandler(payload)"
    />
  </b-dropdown>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useNotificationsStore } from '@/stores/notifications'
import { computed, ref } from 'vue'
import CollectionAddToList, { ItemWithCollections } from './CollectionAddToList.vue'
import type Collection from '@/models/Collection'

export interface Props {
  items: ItemWithCollections[]
  text?: string
  initialIsOpen?: boolean
  right?: boolean
}

const { items, text, right } = defineProps<Props>()

const emit = defineEmits<{
  (e: 'change', payload: { items: ItemWithCollections[]; collection: Collection }): void
}>()

const isVisible = ref(false)
const userStore = useUserStore()
const { addNotification } = useNotificationsStore()
const isLoggedIn = computed<boolean>(() => {
  return !!userStore.userData
})

const collectionAddToListChangeHandler = (payload: {
  items: ItemWithCollections[]
  collection: Collection
}) => {
  for (const item of payload.items) {
    addNotification({
      type: 'info',
      title: '',
      message: `${item.added ? 'added to' : 'removed from'} collection "${payload.collection.name}"`
    })
  }

  emit('change', { items: payload.items, collection: payload.collection })
}
</script>
