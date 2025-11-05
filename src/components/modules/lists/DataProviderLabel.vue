<template>
  &mdash; {{ $t('label_providedBy') }}
  <ItemSelector
    v-if="showLink"
    :uid="item.id"
    :label="title"
    :item="{ uid: item.id, name: title }"
    type="partner"
    :class="titleClass"
    hideIcon
  />
  <span v-else :class="titleClass">{{ title }}</span>
</template>

<i18n lang="json">
{
  "en": {
    "label_providedBy": "provided by"
  }
}
</i18n>

<script setup lang="ts">
import type { DataProvider } from '@/models'
import ItemSelector from '../ItemSelector.vue'
import { computed } from 'vue'
import { dataProviders } from '@/services'

export interface DataProviderLabelProps {
  item: DataProvider
  showLink?: boolean
  titleClass?: string
  class?: string
}

const props = withDefaults(defineProps<DataProviderLabelProps>(), {
  showLink: true,
  titleClass: '',
  class: ''
})

const title = computed(() => {
  return dataProviders.getDataProviderNameById(props.item.id) ?? props.item.id
})
</script>
