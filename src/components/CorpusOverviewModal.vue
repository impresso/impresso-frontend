<template>
  <Modal
    :show="isVisible"
    :title="modalTitle ?? title"
    modalClasses="PlansModal"
    :dialogClass="props.dialogClass"
    bodyClass="pt-0 pe-4 ps-2"
    @close="dismiss"
  >
    <h1 class="mt-3">{{ title }}</h1>
    <LoadingBlock v-if="isLoading" :height="1000" />
    <section v-else>
      <div class="container">
        <div class="row my-3">{{ content }}</div>
      </div>
      <div class="container bg-light">
        <div class="row position-sticky top-0 bg-light" style="z-index: 1">
          <div class="col-sm-2">{{ $t('label_time_period') }}</div>
          <div class="col-sm-2">{{ $t('label_media_medium') }}</div>
        </div>
      </div>
    </section>
  </Modal>
</template>
<i18n>
{
  "en": {
    "label_time_period": "Time Period",
    "label_media_medium": "Media / Medium"
  }
}
</i18n>
<script setup lang="ts">
import Modal from './base/Modal.vue'
import Icon from './base/Icon.vue'
import LoadingBlock from './LoadingBlock.vue'

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
    acceptTermsDate?: string | null
    datasets?: Dataset[]
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-xl',
    title: 'Ciao Impresso Corpus Overview',
    modalTitle: 'Impresso Corpus Overview:  Data Accessibility and Usage Permissions',
    content:
      'The Impresso Corpus features newspaper titles and radio broadcasts from various cultural heritage institutions. This table outlines its composition, detailing data accessibility (required [user plans](/datalab/plans)) and permitted uses.'
  }
)

const emit = defineEmits(['dismiss'])

const dismiss = () => {
  console.debug('[TermsOfUseModal] dismiss')
  emit('dismiss')
}
</script>
