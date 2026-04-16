<template>
  <i-layout>
    <i-layout-section>
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
        <PageNavbarHeading :label="$t('types.' + props.mediaSource.type)" :title="title">
          <template #actions>
            <b-nav-item :to="{ name: 'faq' }" class="active" active-class="none">
              <span v-html="$t('tableOfContents')"></span>
            </b-nav-item>
          </template>
        </PageNavbarHeading>
        <b-tabs pills class="mx-3">
          <template v-slot:tabs-end>
            <li class="nav-item pl-2" v-for="tab in nestedRoutes" :key="tab.name">
              <RouterLink
                :to="{ name: tab.name, params: { id: props.mediaSource.id } }"
                class="nav-link"
                active-class-exact="active"
              >
                {{ $t(`route.${tab.name}`) }}
              </RouterLink>
            </li>
          </template>
        </b-tabs>
      </template>
      <router-view :mediaSource="props.mediaSource">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12 position-sticky top-0 bg-light z-index-1 border-bottom py-2">
              {{ otherTitles.join(', ') }}
            </div>
          </div>
          <div class="row" v-for="category in Categories" :key="category">
            <div class="col-12 position-sticky top-0 bg-light z-index-1 border-bottom py-2">
              <h3 class="font-weight-bold font-size-inherit text-capitalize m-0">
                {{ $t('category.' + category) }}
              </h3>
            </div>
            <div
              class="col-sm-12 col-md-6 col-lg-6 col-xl-3"
              v-for="(values, prop) in mappedProperties[category]"
              :key="prop"
            >
              <div class="py-2 small">
                <div class="font-weight-bold mb-2">{{ $t('property.' + prop) }}</div>
                <div class="border rounded px-2 bg-light d-inline-block">
                  <div v-for="(value, i) in values" :key="i">{{ value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <pre>
        {{ JSON.stringify(props.mediaSource, null, 2) }}
      </pre
        >
      </router-view>
    </i-layout-section>
  </i-layout>
</template>
<script lang="ts" setup>
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import type { MediaSource } from '@/models/generated/canonical'
import { Routes } from '@/router/routes'
import { computed } from 'vue'

const props = defineProps<{ mediaSource: MediaSource }>()
const nestedRoutes = [Routes.mediaSource, Routes.mediaSourceOverview]
const Categories = [
  'identity',
  'temporal',
  'geo',
  'specs',
  'historiography',
  'production',
  'resourceHolder'
] as const

const propertiesByCategories: Record<(typeof Categories)[number], string[]> = {
  identity: [
    'longTitle',
    'variantTitle',
    'otherTitle',
    'subtitle',
    'partnerUid',
    'description',
    'bibRecText',
    'topics'
  ],
  temporal: ['firstPubYear', 'lastPubYear', 'periodicity', 'formerPeriodicity'],
  geo: [],
  specs: [],
  historiography: [],
  production: [],
  resourceHolder: []
}

const categoryByProperty: Record<string, string> = Object.entries(propertiesByCategories).reduce(
  (acc, [category, props]: [string, string[]]) => {
    props.forEach(prop => {
      acc[prop] = category
    })
    return acc
  },
  {} as Record<string, string>
)

const otherTitles = computed(() => {
  return props.mediaSource.properties
    .filter(prop => ['otherTitle', 'variantTitle'].includes(prop.id))
    .map(prop => prop.value)
})

const mappedProperties = computed(() => {
  // fill the propertiesByCategories with the values from mediaSource.properties
  const mapped: Record<string, Record<string, string[]>> = {}
  props.mediaSource.properties.forEach(prop => {
    const category = categoryByProperty[prop.id] || 'uncategorized'
    if (!mapped[category]) {
      mapped[category] = {}
    }
    if (!mapped[category][prop.id]) {
      mapped[category][prop.id] = []
    }
    mapped[category][prop.id].push(prop.value)
  })
  return mapped
})

const title = computed(() => {
  const startYear = mappedProperties.value.temporal.firstPubYear?.[0]?.trim()
  const endYear = mappedProperties.value.temporal.lastPubYear?.[0]?.trim()

  return (
    props.mediaSource.name +
    (startYear ? ` (${startYear}` : '') +
    (endYear ? ` - ${endYear})` : startYear ? ')' : '')
  )
})
</script>
<i18n lang="json">
{
  "en": {
    "mediaSource": "Media Source",
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
    },
    "category": {
      "identity": "Identity",
      "temporal": "Temporal",
      "geo": "Geographical",
      "specs": "Specifications",
      "historiography": "Historiography",
      "production": "Production",
      "resourceHolder": "Resource Holder"
    },
    "property": {
      "longTitle": "Long Title",
      "variantTitle": "Variant Title",
      "otherTitle": "Other Title",
      "subtitle": "Subtitle",
      "partnerUid": "Partner UID",
      "description": "Description",
      "bibRecText": "Bibliographical Record Text",
      "topics": "Topics",
      "firstPubYear": "First Publication Year",
      "lastPubYear": "Last Publication Year",
      "periodicity": "Periodicity",
      "formerPeriodicity": "Former Periodicity"
    }
  }
}
</i18n>
