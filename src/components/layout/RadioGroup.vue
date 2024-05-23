<template>
  <div role="radiogroup" tabindex="-1" :class="gClass" v-on="$listeners">
    <RadioGroupItem
      v-for="(option, idx) in options"
      :key="option.value"
      :option="option"
      :type="props.type"
      :modelValue="isSelected(option)"
      @update:modelValue="select(option.value)"/>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import uuid from 'uuid'
import RadioGroupItem, { type Option } from './RadioGroupItem.vue'

const props = defineProps({
  modelValue: {
    type: String
  },
  type: {
    type: String as PropType<'radio' | 'button'>,
    default: 'radio',
    validator: (t: string) => ['radio', 'button'].includes(t),
  },
  options: {
    type: Array as PropType<Option[]>,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue'])
const isButton = computed(() => props.type === 'button')
const uid = computed(() => uuid.v4())

const gClass = computed(() => ({
  'bv-no-focus-ring': true,
  'btn-group-toggle': isButton.value,
  'btn-group': isButton.value,
  'btn-group-sm': isButton.value,
}))

const select = (value: string) => {
  emit('update:modelValue', value)
}

const isSelected = (option: Option) => {
  return option.value === props.modelValue
}

</script>
