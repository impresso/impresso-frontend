<template>
  <fieldset class="b-form-tags form-control h-auto" tabindex="-1">
    <ul class="b-form-tags-list list-unstyled mb-0 d-flex flex-wrap align-items-center">
      <li
        v-for="tag in value"
        :key="tag"
        :title="tag"
        class="badge b-form-tag d-inline-flex align-items-baseline mw-100 badge-secondary"
      >
        <span class="b-form-tag-content flex-grow-1 text-truncate">
          {{ tag }}
        </span>
        <button
          type="button"
          aria-label="Remove tag"
          class="close b-form-tag-remove"
          @click="removeTag(tag)"
        >
          ×
        </button>
      </li>
      <li aria-live="off" class="b-form-tags-field flex-grow-1">
        <form class="d-flex" @submit.prevent="addNewTag">
          <input
            type="text"
            class="b-form-tags-input w-100 flex-grow-1 p-0 m-0 bg-transparent border-0"
            style="outline: 0px; min-width: 5rem"
            v-model.trim="temporaryNewTag"
            :placeholder="props.placeholder"
          />
          <button
            type="button"
            class="btn b-form-tags-button py-0 btn-outline-secondary"
            style="font-size: 90%"
            :disabled="isAddDisabled"
            :class="{ invisible: temporaryNewTag.length === 0, disabled: isAddDisabled }"
            @click="addNewTag"
          >
            Add
          </button>
        </form>
      </li>
    </ul>
  </fieldset>
</template>

<script setup lang="ts">
import { PropType, computed, ref } from 'vue'

const props = defineProps({
  value: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  disabled: Boolean,
  placeholder: String
})

const emit = defineEmits(['input'])

const temporaryNewTag = ref('')

const addNewTag = () => {
  console.info('[Tagsinput] @addNewTag, value:', temporaryNewTag.value)
  const value = temporaryNewTag.value
  if (props.value.includes(value)) {
    console.warn('[Tagsinput] @addNewTag, value already exists:', value)
    return
  }
  emit('input', [...props.value, value])
  // Clear the input field
  temporaryNewTag.value = ''
}

const removeTag = (tag: string) => {
  emit(
    'input',
    props.value.filter(t => t !== tag)
  )
}

const isAddDisabled = computed(() => {
  const value = temporaryNewTag.value.trim()
  return props.value.includes(value) || value.length === 0 || props.disabled
})
</script>
