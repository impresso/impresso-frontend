<template>
  <Modal
    :show="isVisible"
    :title="modalTitle ?? title"
    modalClasses="PlansModal"
    :dialogClass="props.dialogClass"
    bodyClass="pt-0 pe-4 ps-2"
    @close="dismiss"
  >
    <h1>{{ title }}</h1>

    <div class="container">
      <div class="row my-3">
        <MarkdownContent :url="isVisible ? url : undefined" />
      </div>
    </div>
    <div class="container bg-light">
      <div class="row position-sticky top-0 bg-light" style="z-index: 1">
        <div class="col-lg-2"></div>
        <div class="col py-3 d-flex align-items-end" v-for="plan in Content.Plans" :key="plan.id">
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
        <div class="col py-3" v-for="plan in Content.Plans" :key="plan.id">
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
        v-for="key in Object.keys(Content.RequirementsLabels)"
      >
        <div class="col-lg-2 small">
          {{ Content.RequirementsLabels[key] }}
        </div>
        <div
          class="col-lg-2 py-3 d-flex align-items-center justify-content-center"
          v-for="plan in Content.Plans"
          :key="plan.id"
        >
          {{ plan.requirements.includes(key) ? 'Required' : 'Optional' }}
          <Icon v-if="key === 'terms-of-use' && acceptedTermsDate" name="check" />
        </div>
      </div>
      <div class="row my-1">
        <div class="col-12">
          <div class="border-dark border-bottom" style="height: 1px"></div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <h3 class="font-size-inherit font-weight-medium mt-2">Data accessibility</h3>
        </div>
        <div class="col" v-for="plan in Content.Plans" :key="plan.id">
          <div class="row">
            <div class="col small mt-2 text-center">Access in Impresso App</div>
            <div class="col small mt-2 text-center">Export / Download Impresso App & Datalab</div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col pt-1 mb-1 border-bottom border-dark border-dotted">
          <h4 class="font-size-inherit mt-2">Metadata</h4>
        </div>
      </div>
      <!-- DataFeatureMetadata -->
      <PlansModalFeatureRow
        :plans="Content.Plans"
        :label="Content.DataFeatureLabels.metadata"
        :featureIds="['metadata', 'metadata']"
        class="PlansModal__hRow"
      ></PlansModalFeatureRow>
      <div class="row">
        <div class="col pt-1 mb-1 border-bottom border-dark border-dotted">
          <h4 class="font-size-inherit mt-2">Public Data Domain</h4>
        </div>
      </div>
      <div
        v-for="([keyData, keyExport], index) in [
          ['facsimiles-public-domain', 'facsimiles-public-domain']
        ]"
        :key="index"
      >
        <PlansModalFeatureRow
          :plans="Content.Plans"
          :label="Content.DataFeatureLabels[keyData]"
          :featureIds="[keyData, keyExport]"
          class="PlansModal__hRow"
        />
      </div>
      <div class="row">
        <div class="col pt-1 mb-1 border-bottom border-dark border-dotted">
          <h4 class="font-size-inherit mt-2">Protected Data Domain</h4>
        </div>
      </div>
      <div v-for="([keyData, keyExport], index) in [['facsimiles', 'facsimiles']]" :key="index">
        <PlansModalFeatureRow
          :plans="Content.Plans"
          :label="Content.DataFeatureLabels[keyData]"
          :featureIds="[keyData, keyExport]"
          class="PlansModal__hRow"
        />
      </div>

      userPlan: {{ userPlan }}
      {{ Content }}
    </div>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './base/Modal.vue'
import MarkdownContent from './MarkdownContent.vue'
import Content from '@/assets/plans.json'
import PlansModalFeatureRow from './modules/PlansModalFeatureRow.vue'

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    modalTitle?: string
    title?: string
    url?: string
    acceptTermsDate?: Date
    isVisible?: boolean
    userPlan: string
    userPlanLabel: string
    acceptedTermsDate?: Date | null
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
