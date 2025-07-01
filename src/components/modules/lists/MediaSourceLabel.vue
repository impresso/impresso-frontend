<template>
  <div class="MediaSourceLabel">
    <router-link v-if="showLink" :to="routerLinkUrl">
      <span :class="titleClass">{{ title }}</span
      >{{ ' ' }}
      <span class="small-caps" v-if="showType">{{ $t(item.type + '_label') }}</span>
    </router-link>
    <div v-else>
      <span :class="titleClass">{{ title }}</span
      >{{ ' ' }}
      <span class="small-caps" v-if="showType">{{ $t(item.type + '_label') }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { MediaSource } from '@/models'
import { RouterLink } from 'vue-router'
import { computed } from 'vue'

export interface MediaSourceLabelProps {
  item: MediaSource
  showLink?: boolean
  showType?: boolean
  titleClass?: string
}

const props = withDefaults(defineProps<MediaSourceLabelProps>(), {
  showType: true,
  titleClass: 'font-weight-medium text-decoration-underline'
})

const routerLinkUrl = computed(() => ({
  name: 'newspaper_metadata',
  params: { newspaper_uid: props.item.id }
}))

const glob = window as any

const title = computed(() => {
  if (props.item.type === 'newspaper' && typeof glob.impressoNewspapers === 'object') {
    try {
      return glob.impressoNewspapers[props.item.id].name
    } catch (e) {
      // debugger
      return props.item.name || props.item.id
    }
  }
  return props.item.name || props.item.id
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
