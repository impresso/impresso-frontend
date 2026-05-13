<template>
  <span :class="class">
    <span v-html="$t(withDash ? 'label_provided_by_dash_before' : 'label_providedBy')" />
    <ItemSelector
      v-if="showLink"
      :id="item.id"
      :label="title"
      :item="{ id: item.id, name: title }"
      type="partner"
      :class="titleClass"
      hideIcon
    />
    <span v-else :class="titleClass">{{ title }}</span>
  </span>
</template>

<i18n lang="json">
{
  "en": {
    "label_provided_by_dash_before": "&mdash; provided by ",
    "label_providedBy": "Provided by "
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
  withDash?: boolean
}

const props = withDefaults(defineProps<DataProviderLabelProps>(), {
  showLink: true,
  titleClass: '',
  class: '',
  withDash: true
})

const title = computed(() => {
  return dataProviders.getDataProviderNameById(props.item.id) ?? props.item.id
})
</script>
