<template>
  <Modal
    :show="isVisible"
    :title="$t('BaristaModalTitle')"
    modalClasses="InfoModal"
    :dialogClass="props.dialogClass"
    @close="dismiss"
  >
    <h1>{{ $t('BaristaTitle') }}</h1>
    <div class="container-fluid">
      <div class="row">
        <div class="col-6">
          <slot></slot>
        </div>
        <div>Results filters here</div>
      </div>
    </div>
    <template v-slot:modal-footer>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="dismiss">
        {{ $t('close') }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'

export type BaristaModalProps = {
  dialogClass?: string
  isVisible?: boolean
}

const props = withDefaults(defineProps<BaristaModalProps>(), {
  dialogClass: 'modal-dialog-scrollable modal-dialog-centered  modal-lg'
})

const emit = defineEmits(['dismiss'])

function dismiss() {
  emit('dismiss')
}
</script>

<i18n lang="json">
{
  "en": {
    "BaristaTitle": "Ask Barista",
    "BaristaModalTitle": "Ask Barista"
  }
}
</i18n>
