<template>
  <Modal
    :show="isVisible"
    :title="title"
    modalClasses="TermsOfUseModal"
    :dialogClass="props.dialogClass"
    :hideHeaderClose="!canDismiss"
    :hideFooter="!canDismiss"
    @close="dismiss"
  >
    <h1>{{ title }}</h1>
    <slot name="terms-of-use-status"></slot>
    <div style="min-height: 90vh">
      <MarkdownContent :url="isVisible ? url : undefined" />
    </div>
    <slot name="accept-terms-of-use"></slot>
    <template v-if="canDismiss" v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">close</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import MarkdownContent from './MarkdownContent.vue'

/**
 * Terms of Use modal. Until the user has accepted, both the header × and
 * the footer "close" button are hidden so the only way out is to scroll
 * down and check the acceptance box.
 */
const props = withDefaults(
  defineProps<{
    dialogClass?: string
    title?: string
    url?: string
    canDismiss?: boolean
    isVisible?: boolean
  }>(),
  {
    dialogClass: 'modal-dialog-scrollable modal-lg',
    title: 'Terms Of Use',
    url: import.meta.env.VITE_TERMS_OF_USE_MD_URL,
    canDismiss: false
  }
)

const emit = defineEmits(['dismiss'])

const dismiss = () => {
  if (!props.canDismiss) return
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
</style>
