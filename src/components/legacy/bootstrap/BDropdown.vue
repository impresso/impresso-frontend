<template>
  <div :class="dropdownClass">
    <button
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      type="button"
      class="btn dropdown-toggle"
      :class="{
        [`btn-${size}`]: size != undefined,
        [`btn-${variant}`]: variant != undefined
      }"
      @click="isOpen = !isOpen"
      ref="buttonRef"
    >
      <slot name="button-content">
        {{ text }}
      </slot>
      <slot name="button-icon">
        <Icon :scale="0.75" :strokeWidth="1" name="chevron" />
      </slot>
    </button>
    <ul
      role="menu"
      tabindex="-1"
      class="dropdown-menu"
      :class="{ show: isOpen, 'dropdown-menu-right': right }"
      ref="dropdownRef"
    >
      <slot></slot>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useAttrs, ref, watch, computed } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'
import Icon from '@/components/base/Icon.vue'

const props = defineProps({
  size: String,
  variant: String,
  text: String,
  right: Boolean,
  initialIsOpen: Boolean,
  class: String
})
const emit = defineEmits(['shown', 'hidden'])
const attrs = useAttrs()

const isOpen = ref(props.initialIsOpen)

const allowedAttrs = ['onClick', 'title', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BDropdown: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const dropdownRef = ref()
const buttonRef = ref()
const dropdownClass = computed(
  () => `dropdown b-dropdown btn-group ${props.class || ''} ${isOpen.value ? 'show' : ''}`
)

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
  { immediate: true }
)

defineExpose({
  hide: () => (isOpen.value = false),
  show: () => {
    isOpen.value = true
  }
})
</script>
<style>
.dropdown .dropdown-toggle {
  z-index: 1001 !important;
}
.dropdown .dropdown-toggle svg {
  margin-left: var(--spacing-2);
  will-change: transform;
  transition: var(--impresso-transition-ease) transform 0.2s;
}
.dropdown .dropdown-toggle::after {
  display: none;
}
.dropdown .dropdown-toggle:hover svg.Icon_chevron {
  transform: translateY(3px);
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

.dropdown-toggle::after {
  position: absolute;
}
</style>
