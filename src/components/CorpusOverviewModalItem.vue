<template>
  <div class="CorpusOverviewModalItem">
    <div class="col-sm-2 col-xl-1 py-2 border-right d-flex align-items-center">
      <span class="small">{{ dataset.timePeriod }}</span>
    </div>

    <div class="col-sm-2 col-xl-1 py-2 border-right d-flex align-items-center">
      <span class="small-caps">{{ dataset.medium }}</span>
    </div>

    <div class="col-sm-8 col-xl-10 py-3">
      <div class="very-small-caps-bold">
        {{ $t('label_media_source') }}
      </div>
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-1">
        <div class="d-flex flex-wrap align-items-center gap-1">
          <MediaSourceLabel
            :item="{
              id: dataset.mediaId,
              acronym: dataset.mediaId,
              name: dataset.mediaTitle,
              type: dataset.media as any
            }"
            showLink
          />
          <DataProviderLabel
            :item="{ id: dataset.associatedPartner.toString() }"
            showLink
            titleClass="p-0"
          />
        </div>
        <RouterLink :to="searchPageLink" @click="emit('link-clicked')" class="small">
          → {{ $t('label_show_in_search') }}
        </RouterLink>
      </div>
      <div class="row w-100 pt-2">
        <div class="col-3 very-small-caps-bold">
          {{ $t('label_copyright') }}
        </div>
        <div class="col-9 very-small-caps-bold">
          {{ $t('label_minimum_user_plan') }}
        </div>
        <div class="col-3 small">
          {{ dataset.copyright }}
        </div>
        <div class="col-3 small">
          {{ $t('label_minimum_user_plan_explore') }}
          <div class="small-caps">
            {{ plansLabels[dataset.minimumUserPlanRequiredToExploreInWebapp] }}
          </div>
        </div>
        <div class="col-3 small">
          {{ $t('label_minimum_user_plan_transcripts') }}
          <div class="small-caps">
            {{ plansLabels[dataset.minimumUserPlanRequiredToExportTranscripts] }}
          </div>
        </div>
        <div class="col-3 small">
          {{ $t('label_minimum_user_plan_illustrations') }}
          <div class="small-caps">
            {{ plansLabels[dataset.minimumUserPlanRequiredToExportIllustration] }}
          </div>
        </div>
      </div>
    </div>
    <slot name="extra"></slot>
  </div>
</template>
<script setup lang="ts">
import MediaSourceLabel from './modules/lists/MediaSourceLabel.vue'
import DataProviderLabel from './modules/lists/DataProviderLabel.vue'
import type { Dataset } from './CorpusOverviewModal.vue'
import { computed } from 'vue'
import { CommonQueryParameters } from '@/router/util.js'
import { serializeFilters } from '@/logic/filters.js'

const props = defineProps<{
  dataset: Dataset
  plansLabels: { [key: string]: string }
}>()

const emit = defineEmits<{
  (e: 'link-clicked'): void
}>()

const searchPageLink = computed(() => {
  const fromAsDate = new Date(props.dataset.startYear, 0, 0, 0, 0, 0, 0)
  const toAsDate = props.dataset.endYear
    ? new Date(props.dataset.endYear, 12, 31, 23, 59, 59, 999)
    : new Date(props.dataset.startYear, 12, 31, 23, 59, 59, 999)
  if (!fromAsDate.getTime() || !toAsDate.getTime()) {
    console.warn('[CorpusOverviewModal] Invalid date range for dataset:', props.dataset)
    return null
  }

  return {
    name: 'search',
    query: {
      [CommonQueryParameters.SearchFilters]: serializeFilters([
        {
          type: 'daterange',
          q: `${fromAsDate.toISOString()} TO ${toAsDate.toISOString()}`
        },
        {
          type: 'newspaper',
          q: props.dataset.mediaId
        }
      ])
    }
  }
})
</script>
<i18n lang="json">
{
  "en": {
    "label_copyright": "Copyright",
    "label_media_source": "Media source",
    "label_minimum_user_plan": "Minimum user plan",
    "label_minimum_user_plan_explore": "Web App access",
    "label_minimum_user_plan_transcripts": "Transcript access",
    "label_minimum_user_plan_illustrations": "Facsimile access",
    "label_show_in_search": "Show in Search"
  }
}
</i18n>
