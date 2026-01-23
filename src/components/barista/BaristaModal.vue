<template>
  <Modal
    :show="isVisible"
    :title="$t('BaristaModalTitle')"
    modalClass="BaristaModal"
    :dialogClass="props.dialogClass"
    bodyClass="p-0 mt-2 mx-3 border-top "
    @close="dismiss"
    hide-footer
  >
    <template v-slot:modal-header>
      <div class="d-flex align-items-center gap-2">
        <h5 class="modal-title">{{ $t('BaristaModalTitle') }}</h5>
        <button
          type="button"
          :disabled="!hasMessages"
          class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
          @click="resetChat"
        >
          {{ $t('new chat') }}
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
      <div class="row mb-3">
        <div class="col-lg-8 py-2 order-md-2 order-lg-1">
          <BaristaChat
            :filters="suggestedFilters"
            @suggestFilters="handleFiltersChanged"
            @updateHeight="handleUpdateHeight"
          >
          </BaristaChat>
        </div>
        <div class="col-lg-4 py-2 order-md-1 order-lg-2" v-if="baristaStore.sendCurrentFilters">
          <p class="pt-3 border-bottom pb-2 small">
            Barista [ba’rista] is the person behind the counter in a coffee shop: they listen
            carefully to your order, your hesitations, and sometimes even your worries. Of course
            they don’t have the answer you need, but they help you figure it out, and then prepare a
            proper coffee in the meanwhile, to clear your mind. Don’t worry, they’re the ultimate
            local expert: they suggest the connections that matter for your problem, and help you
            understand the neighbourhood, without ever leaving the counter.
          </p>
          <div class="position-sticky top-0 bg-white py-2" v-if="suggestedFilters.length">
            <p>These filters are shared between you and Barista :)</p>
            <SearchPills :filters="suggestedFiltersWithItems" @changed="handleFiltersChanged" />
            <button class="btn btn-outline-primary w-100 mt-3" @click="handleApplyFilters">
              Apply Filters to current search
            </button>
          </div>
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
import BaristaChat from './BaristaChat.vue'
import { computed, ref, watch } from 'vue'
import { filtersItems as filterItemsService } from '@/services'
import { joinFiltersWithItems, serializeFilters } from '@/logic/filters'
import Icon from '../base/Icon.vue'
import { useBaristaStore } from '@/stores/barista'
import { BaristaMessageItem } from '@/services/types/barista'

export type BaristaModalProps = {
  dialogClass?: string
  isVisible?: boolean
  filters?: Filter[]
}
const containerRef = ref<HTMLElement | null>(null)
const props = withDefaults(defineProps<BaristaModalProps>(), {
  dialogClass: ' modal-dialog-centered  modal-dialog-scrollable modal-xl vh-90'
})
const baristaStore = useBaristaStore()

const resetChat = () => {
  console.debug('[BaristaModal] Reset chat requested')
  baristaStore.clearMessages()
}
const hasMessages = computed(() => baristaStore.messages.length > 0)
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

watch(
  () => props.filters,
  newFilters => {
    suggestedFilters.value = [...newFilters]
  },
  { immediate: true }
)
const handleFiltersChanged = (updatedFilters: Filter[]) => {
  suggestedFilters.value = updatedFilters
}

const handleApplyFilters = () => {
  console.debug('[BaristaModal] @handleApplyFilters')
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
