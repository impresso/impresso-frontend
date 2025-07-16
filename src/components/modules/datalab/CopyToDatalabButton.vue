<template>
  <div class="copy-to-datalab-button">
    <button class="btn btn-sm btn-outline-primary" @click="openModal">
      <slot>{{ $t('try_in_datalab') }}</slot>
    </button>

    <Modal
      body-class="pb-0"
      v-model:show="isModalOpen"
      :title="$t('try_in_datalab')"
      @close="closeModal"
      dialogClass="modal-dialog-centered "
      hide-footer
    >
      <p v-html="$t('try_in_datalab_description_html')" />

      <CopyToDatalabPanel :code="displayedCode">
        <template #description>
          <p
            v-if="isExtendedCode"
            v-html="$t('try_in_datalab_description_html_extended')"
            class="text-muted m-2 small"
          />
        </template>
        <template #extra-buttons>
          <div class="custom-control custom-checkbox mb-0">
            <input
              type="checkbox"
              class="custom-control-input"
              :id="uid"
              v-model="isExtendedCode"
            />

            <label class="custom-control-label extended-code-label" :for="uid">
              {{ $t('show_extended_code') }}
            </label>
          </div>
        </template>
      </CopyToDatalabPanel>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import { datalabSupport } from '@/services'
import { useSettingsStore } from '@/stores/settings'
import { v4 } from 'uuid'
import { computed, ref, watchEffect } from 'vue'
import CopyToDatalabPanel from './CopyToDatalabPanel.vue'

const settingsStore = useSettingsStore()

const props = defineProps<{
  base64Filters: string
  resource: string
  functionName: string
  localstoreToggleVariable?: string
  publicApiUrl?: string
}>()

const code = ref('')
const isModalOpen = ref(false)
const uid = computed(() => v4())

const isExtendedCode = computed({
  get() {
    return settingsStore.showExtendedDatalabCode
  },
  set(value: boolean) {
    settingsStore.setShowExtendedDatalabCode(value)
  }
})

// Compute the public API URL as a Python argument
const publicApiUrlAsPythonArg = computed<string>(() => {
  return props.publicApiUrl && props.publicApiUrl.length > 0 ? `"${props.publicApiUrl}"` : ''
})

const initialCode = `from impresso import connect

# Connect to the Impresso Public API
impresso = connect(${publicApiUrlAsPythonArg.value})

`

// Compute the displayed code based on the toggle state
const displayedCode = computed(() => {
  if (isExtendedCode.value) return initialCode + code.value
  return code.value
})

watchEffect(async () => {
  const result = await datalabSupport.get('impresso-py-function', {
    query: {
      filters: props.base64Filters,
      resource: props.resource,
      functionName: props.functionName
    }
  })
  if (!result || !result.code) {
    console.error('Error fetching code from datalabSupport:', result)
    return
  }
  // @todo add this import to the datalabSupport service
  const logical_ops_required = []
  if (result.code.indexOf('AND(') > 0) logical_ops_required.push('AND')
  if (result.code.indexOf('OR(') > 0) logical_ops_required.push('OR')
  if (result.code.indexOf('NOT(') > 0) logical_ops_required.push('NOT')
  const initialCode = result.code
  let reducedCode = '' + initialCode
  if (logical_ops_required.length > 1) {
    reducedCode = `from impresso import (${logical_ops_required.join(', ')})\n\n${initialCode}`
  } else if (logical_ops_required.length === 1) {
    reducedCode = `from impresso import ${logical_ops_required[0]}\n\n${initialCode}`
  }
  code.value = reducedCode
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}
</script>

<style scoped lang="scss">
.copy-to-datalab-button {
  display: inline-block;
}
.extended-code-label {
  display: flex;
  line-height: 1.5rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "try_in_datalab": "Try in Datalab",
    "try_in_datalab_description_html": "Get an <a href='/datalab/token' target='_blank'>API key</a> to explore the data in <a href='/datalab' target='_blank'>Impresso Datalab</a>.",
    "try_in_datalab_description_html_extended": "First time using the API? Check the Impresso Python library documentation or try out our <a href='/datalab/notebooks/impresso-py-connect' target='_blank'>Introduction to the Impresso library</a> notebook.",
    "show_extended_code": "Show extended code"
  },
  "fr": {
    "try_in_datalab": "Essayer dans Datalab",
    "show_extended_code": "Afficher le code étendu"
  },
  "de": {
    "try_in_datalab": "In Datalab ausprobieren",
    "show_extended_code": "Erweiterten Code anzeigen"
  }
}
</i18n>
