<template>
  <div :class="cbClass">
    <input type="checkbox" class="custom-control-input" :value="props.modelValue" :checked="props.modelValue" :id="uid"
      :disabled="props.disabled" @change="handleChanged" :data-testid="dataTestid">
    <label class="custom-control-label" :for="uid">
      <slot></slot>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { v4 } from 'uuid'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  switch: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  dataTestid: {
    type: String,
    default: undefined,
  },
})
const emit = defineEmits(['update:modelValue'])

const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BFormCheckbox: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const uid = computed(() => v4())

const cbClass = computed(() => ({
  'custom-control': true,
  'custom-switch': props.switch,
  'custom-checkbox': !props.switch,
}))

const handleChanged = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>
