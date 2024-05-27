<template>
  <select :class="sClass" @change="handleChange($event)">
    <option
      v-for="option in options"
      :key="option.value"
      :selected="option.value === value"
      :value="option.value">
        {{ option.text }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { PropType, computed, useAttrs } from 'vue'

export interface Option {
  value: string | number
  text: string
}

const props = defineProps({
  value: [String, Number],
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
  }
})
const emit = defineEmits(['change', 'input'])

const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BFormSelect: Unknown attributes: ${unknownAttrs.join(', ')}`)
}


const sClass = computed(() => ({
  'custom-select': true,
  [`custom-select-${props.size}`]: !!props.size,
}))

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('change', target.value)
  emit('input', target.value)
}
</script>
