<template>
  <DataReleaseCard
    :data-release="latestRelease"
    :is-loading="dataReleaseResponse.status === 'loading'"
  ></DataReleaseCard>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { fetchJsonData } from '@/services/data'
import DataReleaseCard from './DataReleaseCard.vue'
import type { DataRelease } from '@/services/types'

const dataReleaseResponse = ref<{
  data: DataRelease[] | null
  status: 'loading' | 'success' | 'error'
}>({
  data: [],
  status: 'loading'
})

const latestRelease = computed<DataRelease>(() => {
  if (dataReleaseResponse.value.data && dataReleaseResponse.value.data.length > 0) {
    return dataReleaseResponse.value.data[0]
  }

  // return "..." where data is
  return {
    id: '...',
    releaseVersion: '...',
    releaseName: '...',
    impressoCorpusOverview: {
      npsStats: {
        titles: 0,
        issues: 0,
        pages: 0,
        contentItems: 0,
        images: 0,
        tokens: 0
      }
    }
  } as DataRelease
})

onMounted(async () => {
  const controller = new AbortController()

  await fetchJsonData<DataRelease[]>(
    import.meta.env.VITE_DATA_RELEASE_CARDS_JSON_URL,
    dataReleaseResponse,
    controller.signal
  )
  console.info('[DataRundown] dataReleaseResponse', dataReleaseResponse.value)

  onBeforeUnmount(() => {
    controller.abort() // cancels the request if component is unmounted
  })
})
</script>
