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
    <LoadingBlock v-if="isLoading" />
    <section v-else>
      <div class="container">
        <div class="row my-3">
          {{ content }}
          <p>
            Explore the data available in the
            <LinkToModal class="text-decoration-underline d-inline" :view="ViewCorpusOverview"
              >Impresso Corpus Catalogue
            </LinkToModal>
            {{ ' ' }} for each plan.
          </p>
        </div>
      </div>
      <slot name="terms-of-use-status"></slot>
      <div class="container bg-light">
        <div class="row position-sticky top-0 bg-light" style="z-index: 1">
          <div class="col-lg-2"></div>
          <div class="col py-3 d-flex align-items-end" v-for="plan in plans" :key="plan.id">
            <h2 className="m-0 font-size-inherit  font-weight-bold">
              {{ plan.title }}
              <div
                v-if="userPlan === plan.id"
                className="badge d-block small-caps mt-2 shadow-sm bg-primary text-white"
              >
                current plan
              </div>
            </h2>
          </div>
          <div class="col-12">
            <div class="border-dark border-bottom" style="height: 1px"></div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-2"></div>
          <div class="col py-3" v-for="plan in plans" :key="plan.title">
            {{ plan.body }}
          </div>
        </div>
        <div class="row my-1">
          <div class="col-12">
            <div class="border-dark border-bottom" style="height: 1px"></div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h3 className="font-size-inherit font-weight-medium mt-2">{{ $t('Requirements') }}</h3>
          </div>
        </div>
        <div
          class="row PlansModal__hRow py-1"
          key="{key}"
          v-for="key in Object.keys(requirementsLabels)"
        >
          <div class="col-lg-2 small PlansModal__hRow__requirementsLabel">
            {{ requirementsLabels[key] }}
          </div>
          <div
            class="col-lg-2 py-3 d-flex align-items-center justify-content-center"
            v-for="plan in plans"
            :key="plan.id"
          >
            <template v-if="plan.requirements.includes(key)">
              <template v-if="key === values.RequirementToU">
                <Icon v-if="!acceptedTermsDate" name="warningCircle" :stroke-width="1.5" />
                <Icon v-else name="check" :stroke-width="1.5" />
              </template>
              <template v-else-if="key === values.RequirementImpressoAccount">
                <Icon v-if="userPlan !== values.PlanGuest" name="check" :stroke-width="1.5" />
                <Icon v-else name="warningCircle" />
              </template>
              <template v-else>
                <Icon name="warningCircle" />
              </template>
            </template>
            <!-- THis equals v-else-if="!plan.requirements.includes(key)" -->
            <template v-else>&mdash;</template>
          </div>
        </div>
        <div class="row my-1">
          <div class="col-12">
            <div class="border-dark border-bottom" style="height: 1px"></div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <h3 class="font-size-inherit font-weight-medium mt-2">Data Accessibility</h3>
          </div>
          <div class="col d-flex" v-for="plan in plans" :key="plan.id">
            <div class="w-50 border-right very-small mt-2 text-center">Access</div>
            <div class="w-50 very-small mt-2 text-center">Export</div>
          </div>
        </div>
        <div class="row">
          <div class="col pt-1 mb-1">
            <h4 class="font-size-inherit mt-2">&rarr; Metadata</h4>
          </div>
        </div>
        <!-- DataFeatureMetadata -->
        <PlansModalFeatureRow
          :plans="plans"
          :label="dataFeatureLabels.metadata"
          :featureIds="[values.DataFeatureMetadata, values.ExportFeatureMetadata]"
          class="PlansModal__hRow"
        ></PlansModalFeatureRow>
        <div class="row">
          <div class="col pt-1 mb-1">
            <h4 class="font-size-inherit mt-2">&rarr; Public Data Domain</h4>
          </div>
        </div>
        <div
          v-for="([keyData, keyExport], index) in [
            [values.DataFeatureFacsimilesPublicDomain, values.ExportFeatureFacsimilesPublicDomain],
            [values.DataFeatureAudioPublicDomain, values.ExportFeatureAudioPublicDomain],
            [values.DataFeatureImagesPublicDomain, values.ExportFeatureImagesPublicDomain],
            [values.DataFeatureTranscriptsPublicDomain, values.ExportFeatureTranscriptsPublicDomain]
          ]"
          :key="index"
        >
          <PlansModalFeatureRow
            :plans="plans"
            :label="dataFeatureLabels[keyData]"
            :featureIds="[keyData, keyExport]"
            class="PlansModal__hRow mb-2"
          />
        </div>
        <div class="row">
          <div class="col pt-1 mb-1">
            <h4 class="font-size-inherit mt-2">&rarr; Protected Data Domain</h4>
          </div>
        </div>
        <div
          v-for="([keyData, keyExport], index) in [
            [values.DataFeatureFacsimiles, values.ExportFeatureFacsimiles],
            [values.DataFeatureAudio, values.ExportFeatureAudio],
            [values.DataFeatureImages, values.ExportFeatureImages],
            [values.DataFeatureTranscripts, values.ExportFeatureTranscripts]
          ]"
          :key="index"
        >
          <PlansModalFeatureRow
            :plans="plans"
            :label="dataFeatureLabels[keyData]"
            :featureIds="[keyData, keyExport]"
            class="PlansModal__hRow mb-2"
          />
        </div>
        <div class="row">
          <div class="col pt-1 mb-1">
            <h4 class="font-size-inherit mt-2">&rarr; Semantic Enrichments</h4>
          </div>
        </div>
        <div
          v-for="([keyData, keyExport], index) in [
            [values.DataFeatureSemanticEnrichments, values.ExportFeatureSemanticEnrichments]
          ]"
          :key="index"
        >
          <PlansModalFeatureRow
            :plans="plans"
            :label="dataFeatureLabels[keyData]"
            :featureIds="[keyData, keyExport]"
            class="PlansModal__hRow mb-2"
          />
        </div>
      </div>
    </section>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Icon from './base/Icon.vue'
import PlansModalFeatureRow from './modules/PlansModalFeatureRow.vue'
import type { Plan } from './modules/PlansModalFeatureRow.vue'
import LoadingBlock from './LoadingBlock.vue'
import LinkToModal from './LinkToModal.vue'
import { PlansJsonUrl, ViewCorpusOverview } from '@/constants'
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import { reducedTimeoutPromise } from '../services/utils'

export interface PlansModalProps {
  isVisible: boolean
  dialogClass?: string
  title?: string
  url?: string
  modalTitle?: string
  userPlan?: string
  acceptedTermsDate?: string | null
}
const props = withDefaults(defineProps<PlansModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-xl',
  title: 'Terms Of Use',
  url: import.meta.env.VITE_PLANS_MD_URL
})

const emit = defineEmits(['dismiss'])

const dismiss = () => {
  console.debug('[TermsOfUseModal] dismiss')
  emit('dismiss')
}

const fetchPlansResponse = ref<{
  data: {
    plans: {
      title: string
      icon: string
      id: string
      features: {
        ref: string
        icon?: string
      }[]
      requirements: string[]
      body: string
    }[]
    AvailablePlans: string[]
    DataFeatureLabels: Record<string, string>
    ExportFeatureLabels: Record<string, string>
    GenericFeatureLabels: Record<string, string>
    RequirementsLabels: Record<string, string>
    values: Record<string, string>
    planContent: {
      excerpt: string
      body: string
    }
    features: string[]
  } | null
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  data: null
})

const plans = computed<Plan[]>(() => fetchPlansResponse.value.data?.plans || [])
const content = computed<string>(() => {
  return (
    fetchPlansResponse.value.data?.planContent.body.replace(
      '[Impresso Corpus](/datalab/corpus-overview)',
      'Impresso Corpus'
    ) || ''
  )
})
const isLoading = computed<boolean>(
  () => fetchPlansResponse.value.status === 'loading' || fetchPlansResponse.value.status === 'idle'
)
const values = computed<Record<string, string>>(() => fetchPlansResponse.value.data?.values || {})
const dataFeatureLabels = computed<Record<string, string>>(
  () => fetchPlansResponse.value.data?.DataFeatureLabels || {}
)
const requirementsLabels = computed<Record<string, string>>(
  () => fetchPlansResponse.value.data?.RequirementsLabels || {}
)
// :content="
//   fetchPlansResponse.data?.planContent.body.replace(
//     '[Impresso Corpus](/datalab/corpus-overview)',
//     'Impresso Corpus'
//   ) || ''
// "

// :plans="fetchPlansResponse.data?.plans || []"
// :dataFeatureLabels="fetchPlansResponse.data?.DataFeatureLabels || {}"
// :requirementsLabels="fetchPlansResponse.data?.RequirementsLabels || {}"
// :isLoading="fetchPlansResponse.status === 'loading' || fetchPlansResponse.status === 'idle'"
// :values="fetchPlansResponse.data?.values || {}"
/**
 * Fetches the plans content from a JSON URL specified in the environment variables.
 *
 * Logs the URL being fetched from for debugging purposes.
 * If the user is not available, the function returns early.
 * Sets the fetchPlansResponse to a loading state before making the request.
 *
 * Upon successful response, updates fetchPlansResponse with the fetched data and sets the status to 'success'.
 *
 * @async
 * @function fetchPlansContent
 * @returns {Promise<void>} A promise that resolves when the fetch operation is complete.
 */
const fetchPlansContent = async (): Promise<void> => {
  console.debug('[PlansModal] fetchPlansContent from JSON:', PlansJsonUrl)
  if (PlansJsonUrl.length === 0) {
    console.warn('[PlansModal] fetchPlansContent - VITE_PLANS_JSON_URL is empty. Aborting fetch.')
    return
  }
  fetchPlansResponse.value = { data: null, status: 'loading' }
  const [data] = await Promise.all([
    axios.get(PlansJsonUrl).then(response => {
      console.info('[PlansModal] fetchPlansContent success:', PlansJsonUrl)
      return response.data
    }),
    reducedTimeoutPromise({ ms: 500, service: 'getPlansJsonUrl', silent: true })
  ])
  fetchPlansResponse.value = { data, status: 'success' }
}

watch(
  () => props.isVisible,
  isVisible => {
    if (isVisible && fetchPlansResponse.value.status === 'idle') {
      console.debug('[PlansModal] isVisible changed to true, fetching plans content')
      fetchPlansContent()
    }
  },
  { immediate: true }
)
</script>

<style>
.PlansModal {
  z-index: 1002;
}
.PlansModal h2,
.PlansModal h3 {
  font-size: inherit;
}
svg.Icon_check {
  stroke: limegreen;
  fill: transparent;
}
svg.Icon_warningCircle {
  stroke: red;
  fill: transparent;
}
/* .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
} */

/* button {
  margin: 5px;
} */
</style>
