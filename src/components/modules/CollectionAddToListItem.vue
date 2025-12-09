<template>
  <li
    class="CollectionAddToListItem py-1 px-2 d-flex align-items-center gap-2"
    :class="{ active: !isLoading && isChecked, isLoading }"
    @click="$emit('toggle', collection)"
  >
    <input class="form-check-input" type="checkbox" :id="collection.uid" :checked="isChecked" />

    <Icon v-if="isChecked" :strokeWidth="2" :scale="0.75" name="checkCircle" class="me-1" />
    <Icon v-else :strokeWidth="1.5" :scale="0.75" name="circle" class="me-1" />
    <div class="form-check-label" :for="collection.uid">
      <h4 class="font-size-inherit font-weight-bold m-0">{{ collection.name }}</h4>
      <p class="date text-muted small m-0" :title="$t('last_edited')">
        {{ $d(collection.lastModifiedDate, 'short') }}
      </p>
    </div>
  </li>
</template>

<script setup lang="ts">
import type Collection from '@/models/Collection'
import Icon from '../base/Icon.vue'

export interface Props {
  collection: Collection
  isChecked: boolean
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  isChecked: false
})

defineEmits<{
  toggle: [collection: Collection]
}>()
</script>

<style lang="css">
li.CollectionAddToListItem {
  position: relative;
  cursor: pointer;
  border-radius: 0;
  margin-bottom: 0;
  border-bottom: 1px solid var(--clr-grey-200-rgba-20);
  transition: opacity 0.2s ease-in-out;
  transition-delay: 200ms;
}
li.CollectionAddToListItem:nth-child(1) {
  transition-delay: 0ms;
}
li.CollectionAddToListItem:nth-child(2) {
  transition-delay: 50ms;
}
li.CollectionAddToListItem:nth-child(3) {
  transition-delay: 100ms;
}
li.CollectionAddToListItem:nth-child(4) {
  transition-delay: 150ms;
}
li.CollectionAddToListItem input {
  display: none;
}

li.CollectionAddToListItem.isLoading {
  cursor: not-allowed;
  opacity: 0.4;
  pointer-events: none;
}
</style>

<i18n lang="json">
{
  "en": {
    "last_edited": "Last edited"
  }
}
</i18n>
