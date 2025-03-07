<template>
  <div class="copy-to-datalab-button">
    <button class="btn btn-sm btn-outline-primary" @click="openModal">
      <slot>Copy to Datalab</slot>
    </button>

    <Modal v-model:show="isModalOpen" :title="$t('copy_to_datalab')" @close="closeModal">
      <CopyToDatalabPanel :code="code" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import Modal from '@/components/base/Modal.vue'
import CopyToDatalabPanel from './CopyToDatalabPanel.vue'
import { datalabSupport } from '@/services'

const props = defineProps<{
  base64Filters: string
  resource: string
  functionName: string
}>()

const code = ref('')
const isModalOpen = ref(false)

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
    "copy_to_datalab": "Copy to Datalab"
  },
  "fr": {
    "copy_to_datalab": "Copier vers Datalab"
  },
  "de": {
    "copy_to_datalab": "In Datalab kopieren"
  }
}
</i18n>
