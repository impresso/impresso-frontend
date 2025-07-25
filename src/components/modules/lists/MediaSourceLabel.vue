<template>
  <div class="MediaSourceLabel">
    <ItemSelector
      v-if="showLink"
      :uid="item.uid"
      :label="title"
      :item="cachedItem"
      type="newspaper"
      :class="titleClass"
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
    return glob.impressoNewspapers[props.item.uid]
  }
  return { uid: props.item.uid, name: props.item.name || props.item.uid }
})

const title = computed(() => {
  if (typeof glob.impressoNewspapers === 'object' && props.item.type === 'newspaper') {
    if (props.item.uid in glob.impressoNewspapers) {
      return glob.impressoNewspapers[props.item.uid].name || props.item.uid
    }
    return props.item.name || props.item.uid
  }
  return props.item.name || props.item.uid
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
