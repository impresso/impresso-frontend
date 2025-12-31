<template>
  <Modal
    :show="isVisible"
    :title="modalTitle ?? title"
    modalClasses="PlansModal"
    :dialogClass="props.dialogClass"
    bodyClass="pt-0 pe-4 ps-2"
    @close="dismiss"
  >
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
    <h1 class="mt-3">{{ title }}</h1>
    <LoadingBlock v-if="isLoading" :height="1000" />
    <section v-else>
      <div class="container">
        <div class="row my-3">{{ content }}</div>
      </div>
      <div class="container my-3">
        <div class="row">
          <div class="col-sm-2 d-flex align-items-center">
            <label class="small-caps m-0 text-nowrap" for="sortOrder">{{
              $t('label_sort_order')
            }}</label>
            <Dropdown
              v-model="sortOrder"
              class="mx-2"
              :options="sortOptions"
              size="sm"
              variant="outline-secondary"
              data-testid="sortOrder"
            />
            <label class="small-caps m-0 mx-2 text-nowrap" for="sortOrder">{{
              $t('label_show')
            }}</label>
            <b-dropdown class="mx-2" size="sm" variant="outline-secondary" data-testid="sortOrder">
              <template v-slot:button-content>
                <span>{{
                  $tc(filterBySelectedLabel, filteredDatasets.length, {
                    n: filteredDatasets.length,
                    total: props.datasets?.length,
                    userPlan: plansLabels[props.userPlan] || props.userPlan
                  })
                }}</span>
              </template>
              <b-dropdown-item
                v-for="filterBy in filterByOptions"
                :key="filterBy.value"
                @click="() => applyFilter(filterBy)"
              >
                {{ $t(filterBy.text) }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>
      <div class="container bg-light border shadow rounded-md" style="min-height: 30vh">
        <div
          class="row small font-weight-medium position-sticky bg-light top-0 border-bottom border-dark"
          style="
            z-index: 2;
            border-top-left-radius: var(--border-radius-md);
            border-top-right-radius: var(--border-radius-md);
          "
        >
          <div class="col-sm-1 d-flex align-items-center">
            {{ $t('label_time_period') }}
          </div>
          <div class="col-sm-1 border-left d-flex align-items-center">
            {{ $t('label_media_medium') }}
          </div>
          <div class="col-sm-4 border-left d-flex align-items-center">
            {{ $t('label_media_outlet') }}
          </div>
          <div class="col-sm-2 border-left d-flex align-items-center">
            {{ $t('label_copyright') }}
          </div>
          <div class="col-sm-4 border-left pb-2">
            <div class="row">
              <div class="col-sm-12 border-bottom py-2 mb-2">
                {{ $t('label_minimul_user_plan') }}
              </div>
            </div>
            <div class="row">
              <div class="col-sm-4 very-small font-weight-normal">
                {{ $t('label_minimum_user_plan_explore') }}
              </div>
              <div class="col-sm-4 very-small font-weight-normal">
                {{ $t('label_minimum_user_plan_transcripts') }}
              </div>
              <div class="col-sm-4 very-small font-weight-normal">
                {{ $t('label_minimum_user_plan_illustrations') }}
              </div>
            </div>
          </div>
        </div>
        <div
          class="row d-flex align-items-center border-bottom py-2"
          v-for="dataset in sortedDatasets"
          :key="dataset.id"
        >
          <div class="col-sm-1 very-small-caps">{{ dataset.timePeriod }}</div>
          <div class="col-sm-1 very-small-caps">{{ dataset.medium }}</div>
          <div class="col-sm-4 d-flex flex-wrap align-items-center gap-1 small">
            <MediaSourceLabel
              :item="{
                uid: dataset.mediaId,
                acronym: dataset.mediaId,
                name: dataset.mediaTitle,
                type: 'newspaper'
              }"
              :showLink="showLink"
            />
            <DataProviderLabel
              :item="{ id: dataset.associatedPartner.toString() }"
              :showLink="showLink"
              titleClass="p-0"
            />
          </div>

          <div class="col-sm-2">
            <span class="very-small-caps">{{ dataset.copyright }}</span>
          </div>
          <div class="col-sm-4">
            <div class="row small-caps d-flex align-items-center very-small-caps">
              <div class="col-sm-4">
                {{ plansLabels[dataset.minimumUserPlanRequiredToExploreInWebapp] }}
              </div>
              <div class="col-sm-4">
                {{ plansLabels[dataset.minimumUserPlanRequiredToExportTranscripts] }}
              </div>
              <div class="col-sm-4">
                {{ plansLabels[dataset.minimumUserPlanRequiredToExportIllustration] }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Modal>
</template>
<i18n lang="json">
{
  "en": {
    "label_time_period": "Time Period",
    "label_media_medium": "Medium",
    "label_media_outlet": "Media title, media outlet and data partner",
    "label_sort_order": "Order by",
    "label_copyright": "Copyright",
    "label_show_all": "Show all",
    "label_show": "filter by",
    "label_public_domain_only": "Available as Public Domain",
    "label_available_to_me": "Available to me in Web App",
    "label_transcript_available_to_me": "Transcript available to me",
    "label_facsimile_available_to_me": "Facsimile available to me",
    "label_transcript_not_available_to_me": "Transcript not available to me",
    "label_facsimile_not_available_to_me": "Facsimile not available to me",
    "label_minimul_user_plan": "Minimum User Plan",
    "label_minimum_user_plan_explore": "Web App access",
    "label_minimum_user_plan_transcripts": "Transcript access",
    "label_minimum_user_plan_illustrations": "Facsimile access",
    "selected_label_show_all": "Show all ({total})",
    "label_webapp_available_plan-basic": "Available to Basic User in Web App",
    "label_webapp_available_plan-educational": "Available to Educational User in Web App",
    "label_webapp_available_plan-researcher": "Available to Researcher User in Web App",
    "label_transcript_available_plan-basic": "Transcript available to Basic User",
    "label_transcript_available_plan-educational": "Transcript available to Educational User",
    "label_transcript_available_plan-researcher": "Transcript available to Researcher User",
    "label_facsimile_available_plan-basic": "Facsimile available to Basic User",
    "label_facsimile_available_plan-educational": "Facsimile available to Educational User",
    "label_facsimile_available_plan-researcher": "Facsimile available to Researcher User",
    "selected_label_public_domain_only": "Available as Public Domain ({n} of {total})",
    "selected_label_webapp_available_plan-basic": "Available in Web App to Basic User Plan ({n} of {total})",
    "selected_label_transcript_available_plan-basic": "Transcript available to Basic User Plan ({n} of {total})",
    "selected_label_facsimile_available_plan-basic": "Facsimile available to Basic User Plan ({n} of {total})",
    "selected_label_webapp_available_plan-educational": "Available in Web App to Educational User Plan ({n} of {total})",
    "selected_label_transcript_available_plan-educational": "Transcript available to Educational User Plan ({n} of {total})",
    "selected_label_facsimile_available_plan-educational": "Facsimile available to Educational User Plan ({n} of {total})",
    "selected_label_webapp_available_plan-researcher": "Available in Web App to Researcher User Plan ({n} of {total})",
    "selected_label_transcript_available_plan-researcher": "Transcript available to Researcher User Plan ({n} of {total})",
    "selected_label_facsimile_available_plan-researcher": "Facsimile available to Researcher User Plan ({n} of {total})"
  }
}
</i18n>
<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import LoadingBlock from './LoadingBlock.vue'
import Dropdown from './layout/Dropdown.vue'
import MediaSourceLabel from './modules/lists/MediaSourceLabel.vue'
import DataProviderLabel from './modules/lists/DataProviderLabel.vue'
import {
  AvailablePlans,
  PlanEducational,
  PlanGuest,
  PlanImpressoUser,
  PlanResearcher
} from '@/constants'

export type Dataset = {
  id: string
  dataPartnerInstitution: string
  associatedPartner: string
  mediaId: string
  mediaTitle: string
  timePeriod: string
  startYear: number
  endYear: number
  media: string
  medium: string
  copyright: string
  permittedUse: string
  minimumUserPlanRequiredToExploreInWebapp: string
  minimumUserPlanRequiredToExportTranscripts: string
  minimumUserPlanRequiredToExportIllustration: string
  partnerBitmapIndex: number
}

const IsContentAvailableToMe = (userPlan: string, accessLevels: string[]) => {
  const plans = [PlanGuest, userPlan]
  if (userPlan === PlanEducational) {
    plans.push(PlanImpressoUser)
  } else if (userPlan === PlanResearcher) {
    plans.push(PlanEducational, PlanImpressoUser)
  }
  return accessLevels.some(di => plans.includes(di))
}

const PlanCapabilities = [
  { key: 'ExploreInWebapp', label: 'Available to me', textPrefix: 'webapp_available' },
  {
    key: 'ExportTranscripts',
    label: 'Transcript available to me',
    textPrefix: 'transcript_available'
  },
  {
    key: 'ExportIllustration',
    label: 'Facsimile available to me',
    textPrefix: 'facsimile_available'
  }
]

const DefaultFilterByOptions: {
  accessor: ((options: any) => (d: Dataset) => boolean) | null
  value: string
  text: string
}[] = [
  { accessor: null, value: 'all', text: 'label_show_all' },
  {
    accessor: () => (d: Dataset) => d.copyright === 'Public Domain',
    value: 'Public Domain',
    text: 'label_public_domain_only'
  },
  // Dynamically generate plan-based filters
  ...PlanCapabilities.flatMap(cap =>
    AvailablePlans.map(plan => ({
      accessor: () => (d: Dataset) =>
        IsContentAvailableToMe(plan, [d[`minimumUserPlanRequiredTo${cap.key}`]]),
      value: `${cap.label} - ${plan}`,
      text: `label_${cap.textPrefix}_${plan}`
    }))
  )
]

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    modalTitle?: string
    title?: string
    content?: string
    isVisible?: boolean
    isLoading?: boolean
    userPlan: string
    plansLabels: { [key: string]: string }
    showLink?: boolean
    acceptTermsDate?: string | null
    datasets?: Dataset[]
    sortOptions?: { value: string; text: string }[]
    defaultSortOrder?: string
    defaultFilterBy?: string
    filterByOptions?: { accessor: any; value: string; text: string }[]
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-xl',
    title: 'Impresso Corpus Overview',
    modalTitle: 'Impresso Corpus Overview:  Data Accessibility and Usage Permissions',
    content:
      'The Impresso Corpus features newspaper titles and radio broadcasts from various cultural heritage institutions. This table outlines its composition, detailing data accessibility and permitted uses.',
    defaultSortOrder: 'timePeriod',
    sortOptions: () => [
      { value: 'timePeriod', text: 'Time Period' },
      { value: 'mediaId', text: 'Media id' },
      { value: 'medium', text: 'Medium' }
    ],
    defaultFilterBy: 'all'
  }
)

const emit = defineEmits(['dismiss'])

const sortOrder = ref(props.defaultSortOrder)
const filterBy = ref(props.defaultFilterBy)
const filterByOptions = ref(DefaultFilterByOptions)

const dismiss = () => {
  console.debug('[TermsOfUseModal] dismiss')
  emit('dismiss')
}

const filteredDatasets = computed<Dataset[]>(() => {
  if (!props.datasets) return []
  if (filterBy.value === 'all') return props.datasets
  const filterIdx = filterByOptions.value.findIndex(opt => opt.value === filterBy.value)
  if (filterIdx === -1) return props.datasets
  // console.log('filtering datasets', filterBy.value)
  return props.datasets.filter(
    filterByOptions.value[filterIdx].accessor({
      userPlan: props.userPlan
    })
  )
})

const sortedDatasets = computed(() => {
  if (!props.datasets) return []
  // console.log('sorting datasets', sortOrder.value)
  return [...filteredDatasets.value].sort((a, b) => {
    if (sortOrder.value === 'timePeriod') {
      return a.startYear - b.startYear
    } else if (sortOrder.value === 'mediaId') {
      return a.mediaId.localeCompare(b.mediaId)
    } else if (sortOrder.value === 'medium') {
      return a.medium.localeCompare(b.medium)
    }
    return 0
  })
})

const filterBySelectedLabel = computed(() => {
  const filterIdx = filterByOptions.value.findIndex(opt => opt.value === filterBy.value)
  if (filterIdx === -1) return 'n/a'
  return 'selected_' + filterByOptions.value[filterIdx].text
})
const applyFilter = (filterByItem: { accessor: any; value: string; text: string }) => {
  console.info('[CorpusOverviewModal] applyFilter:', filterByItem)
  filterBy.value = filterByItem.value
}
</script>
