<template>
  <div class="MediaSourceMetadata container-xxl" v-if="props.mediaSource">
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
            <div class="d-flex flex-wrap gap-3" v-if="prop === 'institutionLogos'">
              <img
                v-for="src in institutionLogosSrc"
                :key="src"
                :src="src"
                :style="{ maxHeight: '100px' }"
                class="logo d-block my-3"
              />
            </div>
            <template v-else>
              <div v-for="(value, i) in values" :key="i" v-html="value"></div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-3 mb-5 border-top pt-3">
      <div class="col-12 text-right">
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="downloadAsCSV"
          title="$t('actions.downloadMetadataAsCSV')"
        >
          <Icon name="download" />
          <span>{{ $t('actions.downloadMetadataAsCSV') }}</span>
        </button>
      </div>
    </div>
  </div>
  <LoadingBlock v-else />
</template>
<script setup lang="ts">
import { MediaSource } from '@/models/generated/canonical'
import { computed } from 'vue'
import LoadingBlock from '../LoadingBlock.vue'
import Icon from 'impresso-ui-components/components/Icon.vue'

export interface MediaSourceMetadataProps {
  mediaSource?: MediaSource
}

const props = defineProps<MediaSourceMetadataProps>()

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

const urlsToHtml = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, url => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  })
}

const institutionLogosSrc = computed<string[]>(() => {
  const logos = props.mediaSource?.properties.find(prop => prop.id === 'institutionLogos')?.value

  if (!logos) {
    return []
  }
  const regex = /([\w-_ ])+\.(svg|png|jpg|jpeg|gif|bmp)/gi
  const images = logos.match(regex)

  return images.map((d, i) => `https://impresso-project.ch/assets/images/${d.trim()}`)
})

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
    mapped[category][prop.id].push(urlsToHtml(prop.value))
  })
  return mapped
})

const downloadAsCSV = () => {
  if (!props.mediaSource) return

  const rows: string[][] = [['Category', 'Property', 'Value']]

  Object.entries(mappedProperties.value).forEach(([category, properties]) => {
    Object.entries(properties).forEach(([property, values]) => {
      values.forEach((value, index) => {
        rows.push([
          index === 0 ? category : '',
          index === 0 ? property : '',
          // Strip HTML tags for CSV export
          value.replace(/<[^>]*>/g, '')
        ])
      })
    })
  })

  const csv = rows
    .map(row =>
      row
        .map(cell => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        })
        .join(',')
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${props.mediaSource.id || 'media-source'}-metadata.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
<i18n lang="json">
{
  "en": {
    "contentItemOverTime": "Content items over time",
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
