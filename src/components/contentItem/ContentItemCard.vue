<template>
  <div class="ContentItemCard">
    <div class="container-fluid">
      <h3 class="font-weight-bold font-size-inherit mt-3">{{ $t('contentItemCard.citeAs') }}</h3>

      <div class="row">
        <div class="col-12 col-lg-6">
          <p class="text-muted small">{{ $t('contentItemCard.citationFormatHtml') }}</p>
          <ContentItemCitation
            :item="item"
            show-copy-button
            class="p-2 bg-bg-white border rounded small shadow-sm d-inline-block"
          />
        </div>
        <div class="col-12 col-lg-6">
          <p class="text-muted small">{{ $t('contentItemCard.citationFormatBibtext') }}</p>
          <ContentItemCitation
            :item="item"
            show-copy-button
            format="bibtex"
            class="p-2 bg-bg-white border rounded small shadow-sm d-inline-block"
          />
        </div>
      </div>
    </div>
    <div class="container-fluid mt-4 border-top pt-3">
      <h3 class="font-weight-bold font-size-inherit">{{ $t('contentItemCard.rawMetadata') }}</h3>

      <div class="row">
        <div
          v-for="(field, index) in AvailableFields"
          :key="field"
          class="col-md-12 col-lg-6 col-xl-3"
        >
          <div class="py-2 small">
            <div class="font-weight-bold">{{ $t(`contentItemCard.fields.${field}`) }}</div>
            <div class="text-muted small">
              {{ field }}
            </div>
            <div class="border rounded px-2 bg-light d-inline-block">{{ fields[index] }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-fluid my-4 border-top pt-3">
      <h3 class="font-weight-bold font-size-inherit">{{ $t('contentItemCard.access') }}</h3>

      <div class="row">
        <div
          v-for="(field, index) in AccessBitmapFields"
          :key="field"
          class="col-md-12 col-lg-6 col-xl-3"
        >
          <div class="py-2 small">
            <div class="font-weight-bold">{{ $t(`contentItemCard.fields.${field}`) }}</div>
            <div class="text-muted small mb-2">
              {{ field }}
            </div>
            <div class="border rounded px-2 bg-light d-inline-block">
              {{ bitmapFields[index].binary }}
            </div>
            <div></div>
            <p class="small m-2">
              <span class="text-muted"> {{ $t(`contentItemCard.descriptions.${field}`) }} </span>:
              <span class="font-weight-bold">{{
                bitmapPlans[index].length > 0
                  ? bitmapPlans[index].join(', ')
                  : $t('contentItemCard.specialMembershipRequired')
              }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import ContentItemCitation from '../ContentItemCitation.vue'
import { computed, ref } from 'vue'
import { decodeBase64Bitmap, DecodedBitmap, getPlansFromDecodedBitmap } from '@/logic/bitmap'

/** Content Item to display metadata for */
export type ContentItemModalProps = {
  item: ContentItemType
}

const props = defineProps<ContentItemModalProps>()

const AvailableFields = [
  'id',
  'text.title',
  'semanticEnrichments.ocrQuality',
  'access.copyright',
  'meta.date',
  'meta.mediaId',
  'meta.sourceMedium',
  'meta.countryCode',
  'meta.provinceCode',
  'meta.partnerId',

  'text.contentLength',
  'text.documentType',
  'text.itemType',
  'text.langCode',
  'text.originalLangCode',

  'image.isFrontPage',
  'text.snippet'
] as const

const AccessBitmapFields = [
  'access.accessBitmaps.explore',
  'access.accessBitmaps.getTranscript',
  'access.accessBitmaps.getImages'
] as const

/**
 * Helper function to get nested property values using dot notation
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}

const fields = computed(() => {
  return AvailableFields.map(field => getNestedValue(props.item, field) ?? '-')
})
const bitmapFields = computed<DecodedBitmap[]>(() => {
  return AccessBitmapFields.map(field => {
    const value = getNestedValue(props.item, field)
    return decodeBase64Bitmap(value)
  })
})

const bitmapPlans = computed(() =>
  bitmapFields.value.map(decodedBitmap => getPlansFromDecodedBitmap(decodedBitmap))
)
</script>
<i18n lang="json">
{
  "en": {
    "contentItemCard": {
      "citationFormatHtml": "HTML Citation",
      "citationFormatBibtext": "BibTeX Citation",
      "specialMembershipRequired": "Special membership required",
      "citeAs": "Cite as",
      "rawMetadata": "Raw Metadata",
      "access": "Access",
      "fields": {
        "id": "ID",
        "text": {
          "title": "Title",

          "contentLength": "Content Length",
          "documentType": "Document Type",
          "itemType": "Item Type",
          "langCode": "Language Code",
          "originalLangCode": "Original Language Code",
          "snippet": "Text Snippet"
        },

        "semanticEnrichments": {
          "ocrQuality": "OCR Quality"
        },
        "access": {
          "copyright": "Copyright",
          "accessBitmaps": {
            "explore": "Explore Access Bitmap",
            "getTranscript": "Get Transcript Access Bitmap",
            "getImages": "Get Images Access Bitmap"
          }
        },
        "meta": {
          "date": "Date",
          "mediaId": "Media ID",
          "sourceMedium": "Source Medium",
          "countryCode": "Country Code",
          "provinceCode": "Province Code",
          "partnerId": "Partner ID"
        },
        "image": {
          "isFrontPage": "Is Front Page"
        }
      },
      "descriptions": {
        "access": {
          "accessBitmaps": {
            "explore": "Minimal requirement to explore in the Web App",
            "getTranscript": "Minimal requirement to get the transcript of the content item",
            "getImages": "Minimal requirement to get the facsimiles of the content item"
          }
        }
      }
    }
  }
}
</i18n>
