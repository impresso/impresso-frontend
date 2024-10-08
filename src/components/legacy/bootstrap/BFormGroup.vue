<template>
  <component :is="topLevelComponent" :class="fgClass" v-bind="$attrs">
    <label
      v-if="props.label != null"
      :class="{
        'bv-no-focus-ring': isFieldset,
        'pt-0': isFieldset,
        'd-block': !isFieldset,
      }"
      :for="props.labelFor"
    >
      {{ props.label }}
    </label>
    <div>
      <slot></slot>
      <small
        v-if="props.description != null"
        tabindex="-1"
        class="form-text text-muted">
        {{ props.description }}
      </small>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = defineProps({
  id: String,
  label: String,
  labelFor: String,
  description: String,
})
const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BFormGroup: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const isFieldset = computed(() => props.labelFor == null)
const labelDefined = computed(() => props.label != null)
const topLevelComponent = computed(() => isFieldset.value ? 'fieldset' : 'div')

const fgClass = computed(() => ({
  'form-group': true,
}))
</script>
