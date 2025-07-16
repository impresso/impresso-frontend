<template>
  <Modal
    :show="show"
    :id="id"
    :title="title"
    class="rounded"
    no-fade
    hide-backdrop
    modal-class="ConfirmModal"
    content-class="rounded drop-shadow"
    @close="$emit('close')"
  >
    <slot></slot>

    <template v-slot:modal-footer>
      <b-button
        size="sm"
        class="shadow-sm rounded"
        variant="outline-secondary"
        @click="$emit('close')"
      >
        {{ $t('actions.dismiss') }}
      </b-button>
      <b-button
        size="sm"
        class="shadow-sm rounded"
        variant="outline-primary"
        @click="e => $emit('ok')"
      >
        {{ $t(okLabel) }}
      </b-button>
    </template>
  </Modal>
</template>

<script>
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'

/**
 * This modal is used to confirm an action. You can provide id, title and label for ok button in this component properties.
 * @example <ConfirmModal :id="id" :title="title" :ok-label="okLabel" @ok="okHandler" />
 */

export default {
  name: 'ConfirmModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    okLabel: {
      type: String,
      default: 'actions.ok'
    }
  },
  emits: ['ok', 'close'],
  components: { Modal }
}
</script>

<style lang="scss">
.ConfirmModal {
  .modal-content {
    border-radius: 2px;
    box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.5);
  }
  .modal-header {
    border-bottom: 0;
  }
  h2 {
    font-size: 1.5rem;
    font-weight: 500;
  }
}
</style>
