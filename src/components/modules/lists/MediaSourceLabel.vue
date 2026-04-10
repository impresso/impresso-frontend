<template>
  <div class="MediaSourceLabel">
    <ItemSelector
      v-if="showLink"
      :id="item.id"
      :label="title"
      :item="cachedItem"
      type="newspaper"
      :class="titleClass"
      hideIcon
    />
    <span v-else :class="titleClass">{{ title }}</span>
    {{ ' ' }}
    <span class="small-caps" v-if="showType">{{ $t(item.type + '_label') }}</span>
  </div>
</template>
<script lang="ts" setup>
import type { MediaSource } from '@/models'
import ItemSelector from '../ItemSelector.vue'
import { computed } from 'vue'

export interface MediaSourceLabelProps {
  item: MediaSource
  showLink?: boolean
  showType?: boolean
  titleClass?: string
}

const glob = window as any
const props = withDefaults(defineProps<MediaSourceLabelProps>(), {
  showType: true,
  showLink: true,
  titleClass: ''
})

const cachedItem = computed(() => {
  if (typeof glob.impressoNewspapers === 'object') {
    return glob.impressoNewspapers[props.item.id]
  }
  return { id: props.item.id, name: props.item.name || props.item.id }
})

const title = computed(() => {
  return cachedItem.value?.name || props.item.id
})
</script>
<i18n>
{
  "en": {
    "newspaper_label": "Newspaper",
    "radio_label": "Radio",
  }
}
</i18n>
