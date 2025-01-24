<template>
  <div class="MediaOutletLabel">
    <router-link v-if="showLink" :to="routerLinkUrl">
      <span>{{ title }}</span
      >{{ ' ' }}
      <span class="small-caps">{{ $t(item.type + '_label') }}</span>
    </router-link>
    <div v-else>
      <span>{{ title }}</span
      >{{ ' ' }}
      <span class="small-caps">{{ $t(item.type + '_label') }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { MediaOutlet } from '@/services/types'
import { computed } from 'vue'

const props = defineProps<{
  item: MediaOutlet
  showLink: boolean
}>()

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
  return props.item.name || props.item.name || props.item.id
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
