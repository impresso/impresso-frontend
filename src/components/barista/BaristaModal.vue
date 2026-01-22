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
    <template v-slot:modal-header>
      <div class="d-flex align-items-center gap-2">
        <h5 class="modal-title">{{ $t('BaristaModalTitle') }}</h5>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
          @click="resetChat"
        >
          {{ $t('close') }}
          <Icon name="dots" class="ms-1" :scale="0.25" :stroke-width="5" />
        </button>
      </div>
      <button
        type="button"
        class="btn btn-transparent text-dark"
        aria-label="Close"
        @click="dismiss"
      >
        <Icon name="cross" color />
      </button>
    </template>
    <div class="container-fluid" ref="containerRef">
      <div class="row">
        <div class="col-12 py-2">
          <BaristaChat
            :filters="suggestedFilters"
            @suggestFilters="handleFiltersChanged"
            @updateHeight="handleUpdateHeight"
          >
            <SearchPills :filters="suggestedFiltersWithItems" @changed="handleFiltersChanged" />
          </BaristaChat>
        </div>
        <!-- <div class="col-6 results-section position-relative">
          Here you can see your current filters, click on apply to update search results.
          <div class="position-sticky top-0 bg-white py-2" v-if="suggestedFilters.length">
            <button class="btn btn-sm btn-primary mt-2" @click="handleApplyFilters">
              Apply Filters
            </button>
          </div>
          <h5>Results (JSON)</h5>
          <div class="bg-light p-2 my-2 rounded small"></div>
        </div> -->
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
import BaristaChat from './BaristaChat.vue'
import { ref, watch } from 'vue'
import { filtersItems as filterItemsService } from '@/services'
import { joinFiltersWithItems, serializeFilters } from '@/logic/filters'
import Icon from '../base/Icon.vue'
import { useBaristaStore } from '@/stores/barista'

export type BaristaModalProps = {
  dialogClass?: string
  isVisible?: boolean
  filters?: Filter[]
}
const containerRef = ref<HTMLElement | null>(null)
const props = withDefaults(defineProps<BaristaModalProps>(), {
  dialogClass: ' modal-dialog-centered  modal-dialog-scrollable modal-lg vh-90'
})
const baristaStore = useBaristaStore()

const resetChat = () => {
  console.debug('[BaristaModal] Reset chat requested')
  baristaStore.clearMessages()
}

const handleUpdateHeight = (height: number) => {
  console.debug('[BaristaModal] Height update requested:', height)
  const scrollableModalBody = containerRef.value?.parentElement

  if (scrollableModalBody) {
    scrollableModalBody.scrollTo({
      top: height,
      behavior: 'smooth'
    })
  }
}
const emit = defineEmits<{
  dismiss: []
  applyFilters: [updatedFilters: Filter[]]
}>()

const suggestedFilters = ref<Filter[]>(props.filters || [])
const suggestedFiltersWithItems = ref<Filter[]>([])

watch(
  () => suggestedFilters.value,
  async newFilters => {
    suggestedFiltersWithItems.value = await filterItemsService
      .find({
        query: {
          filters: serializeFilters(newFilters)
        }
      })
      .then(joinFiltersWithItems)
  },
  { immediate: true }
)
const handleFiltersChanged = (updatedFilters: Filter[]) => {
  suggestedFilters.value = updatedFilters
}

const handleApplyFilters = () => {
  emit('applyFilters', suggestedFilters.value)
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
