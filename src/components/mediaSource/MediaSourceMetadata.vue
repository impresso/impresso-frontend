<template>
  <div class="container" v-if="props.mediaSource">
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
        <div class="py-2">
          <div class="font-weight-bold very-small mb-2">{{ $t('property.' + prop) }}</div>
          <div class="border rounded px-2 bg-light d-inline-block">
            <div v-for="(value, i) in values" :key="i">{{ value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <LoadingBlock v-else />
</template>
<script setup lang="ts">
import { MediaSource } from '@/models/generated/canonical'
import { computed } from 'vue'
import LoadingBlock from '../LoadingBlock.vue'

const props = defineProps<{
  mediaSource?: MediaSource
}>()

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
  geo: ['publicationPlace', 'countryCode', 'provinceCode', 'localGeographicOutreach'],
  specs: ['ocr', 'olr', 'asrFormat', 'ocrFormat'],
  historiography: ['dhsLink', 'wikipedia', 'additionalSources', 'bibRecLink'],
  production: ['founder', 'publisher', 'editor', 'printer'],
  resourceHolder: [
    'institutionNames',
    'institutionLinks',
    'institutionLogos',
    'provenanceId',
    'permalink',
    'institutionPortal'
  ]
}

const mappedProperties = computed(() => {
  if (!props.mediaSource) {
    return {}
  }
  const categoryByProperty: Record<string, string> = Object.entries(propertiesByCategories).reduce(
    (acc, [key, propNames]: [string, string[]]) => {
      propNames.forEach(prop => {
        acc[prop] = key
      })
      return acc
    },
    {} as Record<string, string>
  )
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
</script>
<i18n lang="json">
{
  "en": {
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
      "formerPeriodicity": "Former Periodicity",
      "publicationPlace": "Publication Place",
      "countryCode": "Country Code",
      "provinceCode": "Province Code",
      "localGeographicOutreach": "Local Geographic Outreach",
      "ocr": "OCR",
      "olr": "OLR",
      "asrFormat": "ASR Format",
      "ocrFormat": "OCR Format",
      "dhsLink": "DHS Link",
      "wikipedia": "Wikipedia",
      "additionalSources": "Additional Sources",
      "bibRecLink": "Bibliographical Record Link",
      "founder": "Founder",
      "publisher": "Publisher",
      "editor": "Editor",
      "printer": "Printer",
      "institutionNames": "Institution Names",
      "institutionLinks": "Institution Links",
      "institutionLogos": "Institution Logos",
      "provenanceId": "Provenance ID",
      "permalink": "Permalink",
      "institutionPortal": "Institution Portal"
    }
  }
}
</i18n>
