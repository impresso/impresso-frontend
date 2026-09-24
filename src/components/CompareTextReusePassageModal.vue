<template>
  <Modal
    :show="isVisible"
    :title="$t('comparePassagesInCluster')"
    modalClass="CompareTextReusePassageModal"
    dialogClass="modal-dialog-scrollable modal-xl"
    :hideFooter="true"
    @close="dismiss"
  >
    <div class="CompareTextReusePassageModal_body d-flex flex-column">
      <TextReusePassageMonitor v-if="item" :item="item" class="flex-grow-1 bg-dark" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import TextReusePassageMonitor from '@/components/TextReusePassageMonitor.vue'
import type { Props as TextReusePassageMonitorProps } from '@/components/TextReusePassageMonitor.vue'

export interface CompareTextReusePassageModalProps {
  isVisible?: boolean
  item?: TextReusePassageMonitorProps['item'] | null
}

withDefaults(defineProps<CompareTextReusePassageModalProps>(), {
  isVisible: false,
  item: null
})

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const dismiss = () => {
  emit('dismiss')
}
</script>

<style lang="css">
.CompareTextReusePassageModal .modal-body {
  padding: 0;
}

.CompareTextReusePassageModal_body {
  min-height: 70vh;
}
</style>

<i18n lang="json">
{
  "en": {
    "comparePassagesInCluster": "Compare passages in cluster"
  }
}
</i18n>
