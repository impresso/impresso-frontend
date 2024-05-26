<template>
  <div class="dropdown b-dropdown btn-group" :class="{show: isOpen}">
    <button
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      type="button"
      class="btn dropdown-toggle"
      :class="{
        [`btn-${size}`]: size != undefined,
        [`btn-${variant}`]: variant != undefined,
      }"
      @click="isOpen = !isOpen"
      ref="buttonRef">
      <slot name="button-content">
        {{text}}
      </slot>
    </button>
    <ul
      role="menu"
      tabindex="-1"
      class="dropdown-menu"
      :class="{show: isOpen, 'dropdown-menu-right': right}"
      ref="dropdownRef">
      <li role="presentation">
        <slot></slot>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useAttrs, ref, watch } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'

const props = defineProps({
  size: String,
  variant: String,
  text: String,
  right: Boolean,
})
const emit = defineEmits(['shown', 'hidden'])
const attrs = useAttrs()

const isOpen = ref(false)

const allowedAttrs = ['onClick', 'title']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BDropdown: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const dropdownRef = ref()
const buttonRef = ref()

useClickOutside(
  dropdownRef,
  () => isOpen.value = false,
  buttonRef
)

watch(isOpen, (value) => {
  if (value) {
    emit('shown')
  } else {
    emit('hidden')
  }
}, { immediate: true })

</script>
