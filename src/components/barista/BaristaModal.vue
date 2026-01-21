<template>
  <Modal
    :show="isVisible"
    :title="$t('BaristaModalTitle')"
    modalClass="BaristaModal"
    :dialogClass="props.dialogClass"
    bodyClass="p-0 mt-2 mx-3 border-top"
    @close="dismiss"
    hide-footer
  >
    <div class="container-fluid">
      <div class="row">
        <div class="col-6 py-2">
          <slot></slot>
        </div>
        <div class="col-6 results-section position-relative">
          Here you can see your current filters, click on apply to update search results.
          <div class="position-sticky top-0 bg-white py-2" v-if="filters.length">
            <SearchPills :filters="filters" @changed="handleFiltersChanged" />
            <button class="btn btn-sm btn-primary mt-2">Apply Filters</button>
          </div>
          <h5>Results (JSON)</h5>
          <div class="bg-light p-2 my-2 rounded small"></div>
        </div>
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
import SearchPills from '../SearchPills.vue'
import type { Filter } from '@/models'

export type BaristaModalProps = {
  dialogClass?: string
  isVisible?: boolean
  filters?: Filter[]
}

const props = withDefaults(defineProps<BaristaModalProps>(), {
  dialogClass: ' modal-dialog-centered  modal-dialog-scrollable modal-lg vh-90'
})

const emit = defineEmits<{
  dismiss: []
  applyFilters: [updatedFilters: Filter[]]
}>()

const handleFiltersChanged = (updatedFilters: Filter[]) => {
  emit('applyFilters', updatedFilters)
}

function dismiss() {
  emit('dismiss')
}
</script>

<i18n lang="json">
{
  "en": {
    "baristaTitle": "Ask Barista",
    "BaristaModalTitle": "Ask Barista"
  }
}
</i18n>
<style lang="css">
.BaristaModal {
  --bs-modal-width: 800px;
}
.BaristaModal .modal-header {
  border-bottom: none;
  padding-right: var(--spacing-1);
  padding-bottom: var(--spacing-1);
}

.BaristaModal .modal-footer {
  border-top: none;
  padding-right: var(--spacing-2);
  padding-bottom: var(--spacing-2);
}
</style>
