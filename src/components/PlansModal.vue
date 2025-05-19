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
          <br />
          Explore the data available in the

          <LinkToModal class="text-decoration-underline" :view="ViewCorpusOverview"
            >Impresso Corpus Catalogue</LinkToModal
          >
          for each plan.
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
import Modal from './base/Modal.vue'
import Icon from './base/Icon.vue'
import PlansModalFeatureRow from './modules/PlansModalFeatureRow.vue'
import type { Plan } from './modules/PlansModalFeatureRow.vue'
import LoadingBlock from './LoadingBlock.vue'
import LinkToModal from './LinkToModal.vue'
import { ViewCorpusOverview } from '@/constants'

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    modalTitle?: string
    title?: string
    content?: string
    url?: string
    acceptTermsDate?: Date
    isVisible?: boolean
    isLoading?: boolean
    userPlan: string
    acceptedTermsDate?: string | null
    plans: Plan[]
    values: Record<string, string>
    dataFeatureLabels: Record<string, string>
    requirementsLabels: Record<string, string>
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-xl',
    title: 'Terms Of Use',
    url: import.meta.env.VITE_PLANS_MD_URL
  }
)

const emit = defineEmits(['dismiss'])

const dismiss = () => {
  console.debug('[TermsOfUseModal] dismiss')
  emit('dismiss')
}
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
