<template>
  <button
    type="button"
    class="btn btn-sm btn-outline-secondary d-flex gap-1 align-content-center px-2"
    v-bind="$attrs"
    :title="$t('open')"
    @click="openModal()"
    data-testid="semantic-search-button"
  >
    <slot>
      <span>SemanticSearchButton</span>
      <Icon name="search" :stroke-width="1.75" :scale="0.75" />
    </slot>
  </button>
  <Teleport to="body">
    <Modal
      v-model:show="isModalOpen"
      :title="$t('open')"
      dialogClass="modal-dialog-centered"
      hide-footer
      @close="closeModal"
    >
      <LoadingBlock v-if="isLoading" :height="180" />
      <form v-else @submit.prevent="submit">
        <label :for="inputId" class="small d-block mb-2">{{ $t('label') }}</label>
        <textarea
          :id="inputId"
          class="form-control shadow-md rounded"
          :class="{ 'is-invalid': v$.text.$error }"
          rows="5"
          v-model.trim="text"
          @blur="v$.text.$touch"
          data-testid="semantic-search-input"
        />
        <pre v-if="embeddingResult" class="mt-3 p-2 bg-light rounded small">
          {{ embeddingResult }}
        </pre>
        <div v-if="v$.text.$error" class="invalid-feedback d-block">
          {{ $t('textTooShort', { min: minimumTextLength }) }}
        </div>
        <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0" role="alert">
          {{ errorMessage }}
        </div>
        <div class="d-flex justify-content-end mt-3">
          <button type="submit" class="btn btn-sm btn-outline-secondary">
            {{ $t('searchSemantically') }}
          </button>
        </div>
      </form>
    </Modal>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import useVuelidate from '@vuelidate/core'
import { minLength, required } from '@vuelidate/validators'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import Icon from '@/components/base/Icon.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import type { ImpressoTextEmbeddingRequest } from '@/models/generated/app/requests'
import { embedderTextTool } from '@/services'

const minimumTextLength = 50
defineOptions({
  inheritAttrs: false
})
const text = defineModel<string>({ default: '' })
const isModalOpen = ref(false)
const inputId = `semantic-search-${useId()}`
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const embeddingResult = ref<string | null>(null)

const emit = defineEmits<{
  (e: 'search', { text, embedding }: { text: string; embedding: string }): void
}>()
const v$ = useVuelidate(
  {
    text: { required, minLength: minLength(minimumTextLength) }
  },
  { text }
)

function openModal(initialText = '') {
  text.value = initialText
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function submit() {
  if (!(await v$.value.$validate())) {
    return
  }

  isLoading.value = true
  errorMessage.value = null
  const payload: ImpressoTextEmbeddingRequest = {
    searchTarget: 'text',
    text: text.value
  }

  try {
    const result = await embedderTextTool.create(payload)
    embeddingResult.value = result.embedding
    emit('search', { text: text.value, embedding: embeddingResult.value })
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  } finally {
    isLoading.value = false
  }
}

defineExpose({ openModal })
</script>

<i18n lang="json">
{
  "en": {
    "open": "Search semantically",
    "label": "Paste here long text, it will be transformed into text embedding! Search semantically!",
    "searchSemantically": "Search semantically",
    "textTooShort": "Enter at least {min} characters."
  }
}
</i18n>
