<template>
  <Modal
    :show="isVisible"
    :title="props.modalTitle"
    :modalClass="props.modalClass"
    :dialogClass="props.dialogClass"
    bodyClass="pt-0 pe-4 ps-2"
    @close="dismiss"
    @confirm="confirm"
    hideBackdrop
  >
    <h1 class="mt-3">{{ title }}</h1>
    <LoadingBlock v-if="isLoading" :height="300" />
    <section v-else-if="latestRelease">
      <div class="container">
        <div class="row my-3">
          <p>
            The current Impresso data rundown is available for download. It contains the latest
            version of the Impresso corpus and enrichments.
          </p>
          <DataReleaseCard
            :dataRelease="latestRelease"
            v-if="latestRelease"
            class="p-2 border rounded-sm"
          />
        </div>
      </div>
      <!-- enrichments -->
      <div class="container">
        <div class="row">
          <h3>Enrichments models</h3>
        </div>
      </div>
      <div class="container bg-light border shadow rounded-md">
        <div
          class="row font-weight-medium position-sticky bg-light top-0 border-bottom border-dark py-2"
          style="
            z-index: 2;
            border-top-left-radius: var(--border-radius-md);
            border-top-right-radius: var(--border-radius-md);
          "
        >
          <div class="col-sm-4 d-flex align-items-center">
            {{ $t('label_model_taskName') }}
          </div>
          <div class="col-sm-4 border-left d-flex align-items-center">
            {{ $t('label_model_url') }}
          </div>
        </div>

        <template
          v-for="(availableEnrichment, index) in availableEnrichments"
          :key="availableEnrichment"
        >
          <div
            class="row border-bottom py-2"
            v-for="(mod, index) in latestRelease.impressoEnrichments[availableEnrichment].models"
            :key="mod.modelId"
          >
            <div class="col-sm-4 d-flex align-items-center">
              {{ mod.taskName }}
            </div>
            <div class="col-sm-4 d-flex align-items-center">
              <a :href="mod.huggingFaceLink" target="_blank" class="text-decoration-underline">{{
                mod.modelId
              }}</a>
            </div>
          </div>
        </template>
      </div>
    </section>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import LoadingBlock from '../LoadingBlock.vue'
import { fetchJsonData } from '@/services/data'
import type { DataReleaseExtended } from '@/services/types'
import DataReleaseCard from './DataReleaseCard.vue'

export type DataRundownModalProps = {
  dialogClass?: string
  modalClass?: string
  title?: string
  modalTitle?: string
  isVisible?: boolean
  requestDelay?: number
}

const props = withDefaults(defineProps<DataRundownModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-xl',
  title: 'Corpus & Enrichments Release Card',
  modalTitle: 'Current Impresso data rundown',
  requestDelay: 10
})
const emit = defineEmits(['dismiss', 'confirm'])

const isLoading = ref(true)
const controller = ref(new AbortController())
const dataReleaseResponse = ref<{
  data: DataReleaseExtended[] | null
  status: 'loading' | 'success' | 'error'
}>({
  data: [],
  status: 'loading'
})

const latestRelease = computed<DataReleaseExtended | null>(() => {
  if (dataReleaseResponse.value.data && dataReleaseResponse.value.data.length > 0) {
    return dataReleaseResponse.value.data[0]
  }
  return null
})

const availableEnrichments = computed(() => {
  if (latestRelease.value) {
    return Object.keys(latestRelease.value.impressoEnrichments ?? {})
  }
  return []
})

const dismiss = () => {
  console.debug('[ChangePlanModal] dismiss')
  emit('dismiss')
}
const confirm = () => {
  console.debug('[ChangePlanModal] confirm')
  emit('confirm')
}

watch(
  () => props.isVisible,
  newValue => {
    if (newValue) {
      isLoading.value = true
      fetchJsonData<DataReleaseExtended[]>(
        import.meta.env.VITE_DATA_RELEASE_CARDS_JSON_URL,
        dataReleaseResponse,
        controller.value.signal,
        {
          requestDelay: props.requestDelay
        }
      ).then(() => {
        isLoading.value = false
      })
    }
  },
  { immediate: true }
)
onBeforeUnmount(() => {
  if (controller.value) {
    controller.value.abort() // cancels the request if component is unmounted
  }
})
</script>
<i18n lang="json">
{
  "en": {
    "label_model_taskName": "Task",
    "label_model_url": "Model URL"
  },
  "de": {
    "label_model_taskName": "Aufgabe",
    "label_model_url": "Modell-URL"
  }
}
</i18n>
