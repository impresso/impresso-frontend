<template>
  <Modal
    :show="isVisible"
    :title="title"
    modalClasses="TermsOfUseModal"
    :dialogClass="props.dialogClass"
    @close="dismiss"
  >
    <h1>{{ title }}</h1>
    <Alert type="warning" class="bg-info" style="position: sticky; top: 0">
      <TermsOfUseStatus />
    </Alert>
    <MarkdownContent :url="isVisible ? url : undefined" style="min-height: 90vh" />
    <AcceptTermsOfUse />
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">
        hide for this session
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './base/Modal.vue'
import Alert from './Alert.vue'
import TermsOfUseStatus from './TermsOfUseStatus.vue'
import AcceptTermsOfUse from './AcceptTermsOfUse.vue'
import MarkdownContent from './MarkdownContent.vue'

const props = withDefaults(
  defineProps<{
    dialogClass?: string
    title?: string
    url?: string
    acceptTermsDate?: Date
    isVisible?: boolean
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-lg',
    title: 'Terms Of Use',
    url: import.meta.env.VITE_TERMS_OF_USE_MD_URL
  }
)

const emit = defineEmits(['dismiss'])

const dismiss = () => {
  console.debug('[TermsOfUseModal] dismiss')
  emit('dismiss')
}
</script>

<style>
.TermsOfUseModal {
  z-index: 1002;
}
.TermsOfUseModal h2,
.TermsOfUseModal h3 {
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
