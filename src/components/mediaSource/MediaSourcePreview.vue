<template>
  <div class="ItemPreview">
    <DataProviderLabel
      v-if="dataProviderId"
      :item="{ id: dataProviderId }"
      class="small"
      :withDash="false"
    />
    <blockquote class="border px-2 py-1 mt-2 rounded bg-light">
      <span v-html="title" class="small"></span>{{ ' ' }}
      <span v-for="{ label, value } in labelsAndValues" :key="label" class="small">
        &middot; <strong>{{ $t(`metadata.${label}`) }}:</strong> {{ value }} </span
      >{{ ' ' }}
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

const title = computed(() => {
  if (!loadedMediaSource.value) {
    return '...'
  }
  if (!Array.isArray(loadedMediaSource.value?.properties)) {
    return loadedMediaSource.value.name
  }
  const startYear = loadedMediaSource.value.properties
    .find(prop => prop.id === 'firstPubYear')
    ?.value?.trim()
  const endYear = loadedMediaSource.value.properties
    .find(prop => prop.id === 'lastPubYear')
    ?.value?.trim()

  return (
    loadedMediaSource.value.name +
    (startYear ? ` (${startYear}` : '') +
    (endYear ? ` - ${endYear})` : startYear ? ')' : '')
  )
})

const labelsAndValues = computed<{ label: string; value: string }[]>(() => {
  if (!loadedMediaSource.value) {
    return []
  }

  const paths = [
    'identity.title',
    'identity.longTitle',
    'identity.subtitle',
    'identity.description',
    'production.founder',
    'production.publisher'
  ]
  // Build a compact preview by reading values from configured metadata paths.
  const values: { label: string; value: string }[] = paths
    .map(path => {
      const pathValue = getNestedProperty(mappedMetadataProperties.value, path)
      if (!pathValue) {
        return null
      }
      const values = Array.isArray(pathValue) ? pathValue : [String(pathValue)]
      return {
        label: path,
        value: values.map((v: string) => v.trim()).join(', ')
      }
    })
    .filter(d => d && d.value.length > 0)
  return values
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
<i18n lang="json">
{
  "en": {
    "metadata": {
      "identity": {
        "title": "Title",
        "longTitle": "Long Title",
        "subtitle": "Subtitle",
        "description": ""
      },
      "production": {
        "founder": "Founder",
        "publisher": "Publisher"
      }
    },
    "actions": {
      "more": "more..."
    }
  }
}
</i18n>
