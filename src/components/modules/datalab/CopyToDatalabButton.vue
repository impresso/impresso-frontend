<template>
  <div class="copy-to-datalab-button">
    <button class="btn btn-sm btn-outline-primary" @click="openModal">
      <slot>Copy to Datalab</slot>
    </button>

    <Modal
      v-model:show="isModalOpen"
      :title="$t('copy_to_datalab')"
      @close="closeModal"
      hide-footer
    >
      <CopyToDatalabPanel :code="displayedCode" @copy="closeModal">
        <template #extra-buttons>
          <div class="form-group form-check mb-0">
            <input type="checkbox" class="form-check-input" :id="uid" v-model="isExtendedCode" />
            <label class="form-check-label" :for="uid">
              {{ $t('show_extended_code') }}
            </label>
          </div>
        </template>
      </CopyToDatalabPanel>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed, onMounted } from 'vue'
import Modal from '@/components/base/Modal.vue'
import CopyToDatalabPanel from './CopyToDatalabPanel.vue'
import { datalabSupport } from '@/services'
import { v4 } from 'uuid'

const DefaultLocalstoreVariable = 'copy_to_datalab_extended_code'

const props = defineProps<{
  base64Filters: string
  resource: string
  functionName: string
  localstoreToggleVariable?: string
}>()

const code = ref('')
const isModalOpen = ref(false)
const uid = computed(() => v4())

const isExtendedCodeValue = ref(
  localStorage.getItem(props.localstoreToggleVariable ?? DefaultLocalstoreVariable) === 'true'
)

const isExtendedCode = computed({
  get() {
    return isExtendedCodeValue.value == null ? true : isExtendedCodeValue.value
  },
  set(value: boolean) {
    localStorage.setItem(
      props.localstoreToggleVariable ?? DefaultLocalstoreVariable,
      value.toString()
    )
    isExtendedCodeValue.value = value
  }
})

// Load preference from localStorage on mount
onMounted(() => {
  const savedPreference = localStorage.getItem('datalab_extended_code')
  isExtendedCode.value = savedPreference === 'true'
})

const initialCode = `from impresso import connect

# Connect to the API
impresso = connect()

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
  code.value = result.code
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
</style>

<i18n lang="json">
{
  "en": {
    "copy_to_datalab": "Copy to Datalab",
    "show_extended_code": "Show extended code"
  },
  "fr": {
    "copy_to_datalab": "Copier vers Datalab",
    "show_extended_code": "Afficher le code étendu"
  },
  "de": {
    "copy_to_datalab": "In Datalab kopieren",
    "show_extended_code": "Erweiterten Code anzeigen"
  }
}
</i18n>
