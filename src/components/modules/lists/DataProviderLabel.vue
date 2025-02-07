<template>
  <div class="DataProviderLabel">
    &mdash; {{ $t('label_providedBy') }}
    <ItemSelector
      v-if="showLink"
      :uid="item.id"
      :label="title"
      :item="{ uid: item.id }"
      type="partner"
    />
    <span v-else :class="titleClass">{{ title }}</span>
  </div>
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

interface DataProviderLabelProps {
  item: DataProvider
  showLink?: boolean
  titleClass?: string
}

const glob = window as any
const props = withDefaults(defineProps<DataProviderLabelProps>(), {
  showLink: true,
  titleClass: 'font-weight-medium text-decoration-underline'
})

const title = computed(() => {
  if (typeof glob.impressoDataProviders === 'object') {
    try {
      return glob.impressoDataProviders[props.item.id].name
    } catch (e) {
      return props.item.name || props.item.id
    }
  }
  return props.item.name || props.item.id
})
</script>
