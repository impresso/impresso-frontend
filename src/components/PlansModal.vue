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
    <PlansContent
      :isVisible="isVisible"
      :userPlan="userPlan"
      :acceptedTermsDate="acceptedTermsDate"
    >
      <template #terms-of-use-status>
        <slot name="terms-of-use-status"></slot>
      </template>
    </PlansContent>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import PlansContent from './modules/PlansContent.vue'

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
  console.debug('[PlansModal] dismiss')
  emit('dismiss')
}
</script>

<style>
.PlansModal {
  z-index: 1002;
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
