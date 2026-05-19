<template>
  <div class="ItemPreview">
    <DataProviderLabel
      v-if="dataProviderId"
      :item="{ id: dataProviderId }"
      class="small"
      :withDash="false"
    />
    <blockquote class="border px-2 py-1 mt-2 rounded bg-light">
      <span v-html="previewAsHtml" class="small"></span>{{ ' ' }}
      <router-link
        :to="{
          name: Routes.mediaSourceMetadata.name,
          params: { media_source_id: item.id }
        }"
        @click="emit('more')"
      >
        {{ $t('actions.more') }}
      </router-link>
    </blockquote>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Topic, MediaSource } from '@/models/generated/canonical'
import { mediaSources as mediaSourceService } from '@/services'
import { CategorizedProperties, getMappedProperties, getNestedProperty } from './utils'
import DataProviderLabel from '../modules/lists/DataProviderLabel.vue'
import { Routes } from '@/router/routes'

export interface ItemPreviewProps {
  item: MediaSource | Topic
  itemType: string
}

const emit = defineEmits<{
  (e: 'more'): void
}>()

const props = defineProps<ItemPreviewProps>()

const loadedMediaSource = ref<MediaSource>()
const isLoading = ref(false)
const error = ref(false)

const mappedMetadataProperties = computed(() => {
  if (!loadedMediaSource.value) {
    return {} as CategorizedProperties
  }
  return getMappedProperties(loadedMediaSource.value.properties)
})

const previewAsHtml = computed(() => {
  if (!loadedMediaSource.value) {
    return ''
  }

  const paths = [
    'identity.longTitle',
    'identity.longTitle',
    'identity.subtitle',
    'identity.description',
    'production.founder',
    'production.publisher'
  ]
  // Build a compact preview by reading values from configured metadata paths.
  const values = paths
    .flatMap(path => {
      const pathValue = getNestedProperty(mappedMetadataProperties.value, path)
      if (!pathValue) {
        return []
      }
      return Array.isArray(pathValue) ? pathValue : [String(pathValue)]
    })
    .map(value => value.trim())
    .filter(Boolean)

  return values.join(' · ')
})

const dataProviderId = computed(() => {
  if (!loadedMediaSource.value) {
    return null
  }
  const dataProviderPath = 'identity.partnerUid'
  const dataProviderValue = getNestedProperty(mappedMetadataProperties.value, dataProviderPath)
  if (Array.isArray(dataProviderValue)) {
    return dataProviderValue[0]
  }
  return dataProviderValue
})

async function fetchMediaSource() {
  isLoading.value = true
  error.value = false
  try {
    const response = await mediaSourceService.get(props.item.id)
    loadedMediaSource.value = response
  } catch (err) {
    console.error('Error fetching media source:', err)
    error.value = true
  } finally {
    isLoading.value = false
  }
}

watch(() => props.item.id, fetchMediaSource, { immediate: true })
</script>
