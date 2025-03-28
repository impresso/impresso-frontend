<template>
  <label
    v-if="props.type === 'button'"
    class="btn btn-outline-primary btn-sm"
    :class="{ active: props.modelValue }"
  >
    <input
      type="radio"
      :value="props.option.value"
      :checked="props.modelValue"
      @change="handleChanged"
    />
    <Icon v-if="option.iconName != null && option.iconPosition == 'left'" :name="option.iconName" />
    <span v-html="option.text"></span>
    <Icon
      v-if="option.iconName != null && ['right', undefined].includes(option.iconPosition)"
      :name="option.iconName"
    />
  </label>
  <div v-else-if="props.type === 'radio'" class="custom-control custom-control-inline custom-radio">
    <input
      type="radio"
      class="custom-control-input"
      :value="option.value"
      :id="uid"
      :checked="props.modelValue"
      @change="handleChanged"
    />
    <label class="custom-control-label" :for="uid">
      <span v-html="option.text"></span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'
import { v4 } from 'uuid'
import Icon from '@/components/base/Icon.vue'

export interface Option {
  value: string
  text: string
  disabled?: boolean
  iconName?: string
  iconPosition?: 'left' | 'right'
}

const props = defineProps({
  modelValue: {
    type: Boolean
  },
  type: {
    type: String as PropType<'radio' | 'button'>,
    default: 'radio',
    validator: (t: string) => ['radio', 'button'].includes(t)
  },
  option: {
    type: Object as PropType<Option>,
    required: true
  }
})
const emit = defineEmits(['update:modelValue'])
const uid = computed(() => v4())

const handleChanged = () => {
  if (props.modelValue) return
  emit('update:modelValue', true)
}
</script>
