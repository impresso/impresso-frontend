<template>
  <div :class="cbClass">
    <input
      type="checkbox"
      class="custom-control-input"
      :value="props.value"
      :id="uid"
      :disabled="props.disabled ? 'disabled' : undefined"
      @change="handleChanged">
    <label class="custom-control-label" :for="uid">
      <slot></slot>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { v4 } from 'uuid'

// TODO in Vue3 replace value with modelValue
const props = defineProps({
  value: {
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
})
const emit = defineEmits(['input', 'change'])

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
  emit('input', target.checked)
  emit('change', target.checked)
}
</script>
