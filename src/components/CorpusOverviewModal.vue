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
      <div class="container bg-light border shadow rounded-md">
        <div
          class="row font-weight-medium position-sticky bg-light top-0 border-bottom border-dark"
          style="
            z-index: 2;
            border-top-left-radius: var(--border-radius-md);
            border-top-right-radius: var(--border-radius-md);
          "
        >
          <div class="col-sm-2 border-left d-flex align-items-center">
            {{ $t('label_time_period') }}
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
          <div class="col-sm-2">{{ dataset.timePeriod }}</div>

          <div class="col-sm-4">
            <MediaSourceLabel
              :item="{
                id: dataset.mediaId,
                acronym: dataset.mediaId,
                name: dataset.mediaTitle,
                type: 'newspaper'
              }"
              :showLink="showLink"
            />
            provided by {{ dataset.dataPartnerInstitution }}
            <div class="badge bg-transparent small-caps rounded-sm border border-dark">
              {{ dataset.medium }}
            </div>
          </div>

          <div class="col-sm-2">
            <span class="small-caps">{{ dataset.copyright }}</span>
          </div>
          <div class="col-sm-4">
            <div class="row small-caps d-flex align-items-center">
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
<i18n>
{
  "en": {
    "label_time_period": "Time Period",
    "label_media_medium": "Media / Medium",
    "label_media_outlet": "Media title, media outlet and data partner",
    "label_sort_order": "Order by",
    "label_copyright": "Copyright",
    "label_show_all": "Show all",
    "label_show": "filter by",
    "label_public_domain_only": "Available as Public Domain",
    "label_available_to_me": "Available to me",
    "label_minimul_user_plan": "Minimum User Plan",
    "label_minimum_user_plan_explore": "Explore",
    "label_minimum_user_plan_transcripts": "Transcripts",
    "label_minimum_user_plan_illustrations": "Illustrations",
    "selected_label_show_all": "Show all ({total})",
    "selected_label_public_domain_only": "Available as Public Domain ({n} of {total})",
    "selected_label_available_to_me": "Available to me ({n} of {total}, {userPlan})",
    "label_not_available_to_me": "Not available to me",
    "selected_label_not_available_to_me": "Not available to me ({n} of {total}, {userPlan})"
  }
}
</i18n>
<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Icon from './base/Icon.vue'
import LoadingBlock from './LoadingBlock.vue'
import Dropdown from './layout/Dropdown.vue'
import MediaSourceLabel from './modules/lists/MediaSourceLabel.vue'
import { filter } from 'd3'

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
    defaultFilterBy: 'all',
    filterByOptions: () => [
      { accessor: null, value: 'all', text: 'label_show_all' },
      {
        accessor: () => (d: Dataset) => d.copyright === 'Public Domain',
        value: 'Public Domain',
        text: 'label_public_domain_only'
      },
      {
        accessor:
          ({ userPlan }) =>
          (d: Dataset) =>
            [
              d.minimumUserPlanRequiredToExploreInWebapp,
              d.minimumUserPlanRequiredToExportTranscripts,
              d.minimumUserPlanRequiredToExportIllustration
            ].some(di => {
              return di === userPlan
            }),
        value: 'Available to me',
        text: 'label_available_to_me'
      },
      {
        accessor:
          ({ userPlan }) =>
          (d: Dataset) =>
            ![
              d.minimumUserPlanRequiredToExploreInWebapp,
              d.minimumUserPlanRequiredToExportTranscripts,
              d.minimumUserPlanRequiredToExportIllustration
            ].some(di => {
              return di === userPlan
            }),
        value: 'Not available to me',
        text: 'label_not_available_to_me'
      }
    ]
  }
)

const emit = defineEmits(['dismiss'])

const sortOrder = ref(props.defaultSortOrder)
const filterBy = ref(props.defaultFilterBy)

const dismiss = () => {
  console.debug('[TermsOfUseModal] dismiss')
  emit('dismiss')
}

const filteredDatasets = computed<Dataset[]>(() => {
  if (!props.datasets) return []
  if (filterBy.value === 'all') return props.datasets
  const filterIdx = props.filterByOptions.findIndex(opt => opt.value === filterBy.value)
  if (filterIdx === -1) return props.datasets
  console.log('filtering datasets', filterBy.value)
  return props.datasets.filter(
    props.filterByOptions[filterIdx].accessor({
      userPlan: props.userPlan
    })
  )
})

const sortedDatasets = computed(() => {
  if (!props.datasets) return []
  console.log('sorting datasets', sortOrder.value)
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
  const filterIdx = props.filterByOptions.findIndex(opt => opt.value === filterBy.value)
  if (filterIdx === -1) return 'n/a'
  return 'selected_' + props.filterByOptions[filterIdx].text
})
const applyFilter = (filterByItem: { accessor: any; value: string; text: string }) => {
  console.info('[CorpusOverviewModal] applyFilter:', filterByItem)
  filterBy.value = filterByItem.value
}
</script>
