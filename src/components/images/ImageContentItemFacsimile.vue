<template>
  <div class="ImageContentItemFacsimile view-image">
    <div v-if="manifestUrl" class="facsimile-viewer mb-3 position-relative h-100">
      <IIIFViewer class="h-100" :manifest-urls="[manifestUrl]" />
    </div>
    {{ image }}
    {{ manifestUrl }}
    <SearchResultsImageItem
      v-if="image"
      :is-checked="false"
      :item="image"
      :enable-checkbox="false"
      :enable-similar-to="false"
      :userPlan="userPlan"
      :default-visibility="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SearchResultsImageItem from '@/components/modules/SearchResultsImageItem.vue'
import IIIFViewer from '@/components/modules/IIIFViewer.vue'
import { IImage } from '@/models'

const props = defineProps<{
  image?: IImage | null
  userPlan?: string
}>()

/**
 * The IImage model only exposes a rasterized `previewUrl`
 * (e.g. `.../{identifier}/{region}/{size}/{rotation}/{quality}.{format}`).
 * IIIFViewer needs the manifest (`info.json`) url instead, so, for now, we
 * derive it by stripping the trailing region/size/rotation/quality segments.
 */
const manifestUrl = computed(() => {
  const previewUrl = props.image?.previewUrl
  if (!previewUrl) return undefined
  return previewUrl.replace(/\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/, '/info.json')
})
</script>

<style lang="scss" scoped>
.view-image {
  padding: 1rem;
}

.facsimile-viewer {
  height: 60vh;
  min-height: 400px;
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 0.375rem;
  overflow: hidden;
}
</style>
