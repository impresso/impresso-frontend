<template>
  <i-layout>
    <i-layout-section width="400px" class="d-none d-md-block">
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item :to="{ name: 'faq' }" class="active" active-class="none">
              <span v-html="$t('tableOfContents')"></span>
            </b-nav-item>
          </template>
        </b-tabs>
      </template>
      <nav class="faq-toc mt-2">
        <ul class="list-unstyled">
          <li>test</li>
        </ul>
      </nav>
    </i-layout-section>
    <i-layout-section main>
      <template v-slot:header>
        <PageNavbarHeading :label="$t('types.' + (mediaSource?.type || ''))" :title="title">
          <template #actions>
            <router-link class="btn btn-outline-primary btn-sm" :to="searchPageLink">
              {{ $t('actions.searchMore') }}
            </router-link>
          </template>
          {{ otherTitles }}
        </PageNavbarHeading>

        <b-tabs pills class="mx-3" v-if="mediaSource">
          <template v-slot:tabs-end>
            <li class="nav-item pl-2" v-for="tab in nestedRoutes" :key="tab.name">
              <RouterLink
                :to="{ name: tab.name, params: { media_source_id: mediaSource.id } }"
                class="nav-link"
                :class="{
                  active: route.name === tab.name
                }"
              >
                {{ $t(`route.${tab.name}`) }}
              </RouterLink>
            </li>
          </template>
        </b-tabs>
      </template>
      <router-view :mediaSource="mediaSource" />
    </i-layout-section>
  </i-layout>
</template>
<script lang="ts" setup>
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import type { MediaSource } from '@/models/generated/canonical'
import { Routes } from '@/router/routes'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { me, mediaSources as mediaSourcesService } from '@/services'
import { watch } from 'vue'
import { Filter } from '@/models'
import { serializeFilters } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
const route = useRoute()
const mediaSource = ref<MediaSource>()
const loading = ref(true)
const error = ref(false)

const props = withDefaults(defineProps<{ filtersWithItems: Filter[] }>(), {
  filtersWithItems: () => []
})

const serializedFilters = computed(() => {
  return serializeFilters([{ type: 'newspaper', q: mediaSource.value?.id || '' }])
})

const searchPageLink = computed(() => {
  return {
    name: 'search',
    query: {
      [CommonQueryParameters.SearchFilters]: serializedFilters.value
    }
  }
})
const nestedRoutes = [Routes.mediaSourceMetadata, Routes.mediaSourceOverview]

const otherTitles = computed(() => {
  return mediaSource.value?.properties
    .filter(prop => ['otherTitle', 'variantTitle'].includes(prop.id))
    .map(prop => prop.value.trim())
    .join(', ')
})

const title = computed(() => {
  if (!mediaSource.value) {
    return '...'
  }
  const startYear = mediaSource.value?.properties
    .find(prop => prop.id === 'firstPubYear')
    ?.value?.trim()
  const endYear = mediaSource.value?.properties
    .find(prop => prop.id === 'lastPubYear')
    ?.value?.trim()

  return (
    mediaSource.value.name +
    (startYear ? ` (${startYear}` : '') +
    (endYear ? ` - ${endYear})` : startYear ? ')' : '')
  )
})

async function fetchMediaSource(): Promise<MediaSource | void> {
  loading.value = true
  error.value = false
  try {
    const response = await mediaSourcesService.get(route.params.media_source_id as string)
    mediaSource.value = response
  } catch (err) {
    console.error('Error fetching media source:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}
watch(() => route.params.media_source_id, fetchMediaSource, { immediate: true })
</script>
<i18n lang="json">
{
  "en": {
    "mediaSource": "Media Source",
    "route": {
      "mediaSourceMetadata": "List of Metadata",
      "mediaSourceOverview": "Overview"
    },
    "types": {
      "newspaper": "Newspaper",
      "periodical": "Periodical",
      "book": "Book",
      "manuscript": "Manuscript",
      "map": "Map",
      "photograph": "Photograph",
      "audioRecording": "Audio Recording",
      "videoRecording": "Video Recording",
      "other": "Other"
    }
  }
}
</i18n>
