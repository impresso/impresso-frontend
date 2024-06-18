<template>
  <div role="group" class="b-form-tags form-control h-auto" tabindex="-1">
    <ul class="b-form-tags-list list-unstyled mb-0 d-flex flex-wrap align-items-center">
      <li v-for="tag in value" :key="tag" :title="tag"
        class="badge b-form-tag d-inline-flex align-items-baseline mw-100 badge-secondary">
        <span class="b-form-tag-content flex-grow-1 text-truncate">
          {{ tag }}
        </span>
        <button type="button" aria-label="Remove tag" class="close b-form-tag-remove" @click="removeTag(tag)">×</button>
      </li>
      <li role="none" aria-live="off" class="b-form-tags-field flex-grow-1">
        <div role="group" class="d-flex">
          <input value="" type="text" class="b-form-tags-input w-100 flex-grow-1 p-0 m-0 bg-transparent border-0"
            style="outline: 0px; min-width: 5rem;" v-model="temporaryNewTag" :placeholder="props.placeholder"
            @keydown.enter="addNewTag()">
          <button type="button" class="btn b-form-tags-button py-0 btn-outline-secondary" style="font-size: 90%;"
            :disabled="isAddDisabled"
            :class="{ invisible: temporaryNewTag.trim().length === 0, disabled: isAddDisabled }" @click="addNewTag()">
            Add
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed, ref } from 'vue'


const props = defineProps({
  value: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  disabled: Boolean,
  placeholder: String,
})

const emit = defineEmits(['input'])

const temporaryNewTag = ref('')

const addNewTag = () => {
  if (isAddDisabled.value) return
  const value = temporaryNewTag.value.trim()
  emit('input', [...props.value, value])
  temporaryNewTag.value = ''
}

const removeTag = (tag: string) => {
  emit('input', props.value.filter((t) => t !== tag))
}

const isAddDisabled = computed(() => {
  const value = temporaryNewTag.value.trim()
  return props.value.includes(value) || value.length === 0 || props.disabled

})

</script>
