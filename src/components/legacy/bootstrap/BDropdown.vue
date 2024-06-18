<template>
  <div class="dropdown b-dropdown btn-group" :class="{ show: isOpen }">
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
      ref="buttonRef"
    >
      <slot name="button-content">
        {{ text }}
      </slot>
    </button>
    <ul
      role="menu"
      tabindex="-1"
      class="dropdown-menu"
      :class="{ show: isOpen, 'dropdown-menu-right': right }"
      ref="dropdownRef"
    >
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

const allowedAttrs = ['onClick', 'title', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BDropdown: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const dropdownRef = ref()
const buttonRef = ref()

useClickOutside(dropdownRef, () => (isOpen.value = false), buttonRef)

watch(
  isOpen,
  value => {
    if (value) {
      emit('shown')
    } else {
      emit('hidden')
    }
  },
  { immediate: true },
)

defineExpose({
  hide: () => (isOpen.value = false),
})
</script>
<style>
.dropdown .dropdown-toggle {
  z-index: 1001 !important;
}
.dropdown.show .dropdown-toggle {
  background-color: #fff;
  z-index: 1003 !important;
}
.dropdown .btn.dropdown-toggle:not(.disabled):hover,
.dropdown .btn.dropdown-toggle:not(.disabled):focus {
  background-color: #fff;
}
.dropdown .btn.dropdown-toggle[aria-expanded='true'] {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.dropdown .dropdown-menu {
  z-index: 1000;
  min-width: 100%;
  border-bottom-left-radius: var(--impresso-border-radius-xs);
  border-bottom-right-radius: var(--impresso-border-radius-xs);
}
.dropdown.show .dropdown-menu {
  z-index: 1002;
}
.dropdown-menu.dropdown-menu-right {
  right: 0;
  left: auto;
}
</style>
