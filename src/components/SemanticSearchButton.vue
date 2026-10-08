<template>
  <button
    type="button"
    class="btn btn-outline-primary d-flex align-content-center px-2"
    :title="$t('open')"
    @click="openModal"
    data-testid="semantic-search-button"
  >
    <Icon name="search" :stroke-width="2.5" :height="16" :width="16" />
  </button>
  <Teleport to="body">
    <Modal
      v-model:show="isModalOpen"
      :title="$t('open')"
      dialogClass="modal-dialog-centered"
      hide-footer
      @close="closeModal"
    >
      <label :for="inputId" class="small d-block mb-2">{{ $t('label') }}</label>
      <textarea
        :id="inputId"
        class="form-control"
        rows="5"
        v-model="text"
        data-testid="semantic-search-input"
      />
      <div class="d-flex justify-content-end mt-3">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          @click="emit('search', text)"
        >
          {{ $t('searchSemantically') }}
        </button>
      </div>
    </Modal>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Icon from '@/components/base/Icon.vue'

const text = defineModel<string>({ default: '' })
const isModalOpen = ref(false)
const inputId = `semantic-search-${useId()}`
const emit = defineEmits<{
  (e: 'search', text: string): void
}>()

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}
</script>

<i18n lang="json">
{
  "en": {
    "open": "Search semantically",
    "label": "Paste here long text, it will be transformed into text embedding! Search semantically!",
    "searchSemantically": "Search semantically"
  }
}
</i18n>
