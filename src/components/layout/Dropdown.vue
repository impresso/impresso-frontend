<template>
  <div class="dropdown b-dropdown btn-group" :class="{ show: isOpen }" :data-testid="dataTestid">
    <button
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      type="button"
      class="btn dropdown-toggle d-flex align-items-center"
      :class="{
        [`btn-${size}`]: size != undefined,
        [`btn-${variant}`]: variant != undefined
      }"
      @click="isOpen = !isOpen"
      ref="buttonRef"
    >
      {{ selectedOption.text }}
      <slot name="button-icon">
        <Icon :scale="0.75" :strokeWidth="1" name="chevron" />
      </slot>
    </button>
    <ul
      tabindex="-1"
      class="dropdown-menu position-absolute"
      :class="{ show: isOpen, 'dropdown-menu-right': right }"
      ref="dropdownRef"
    >
      <li v-for="option in options" :key="option.value">
        <a
          role="menuitem"
          target="_self"
          :aria-disabled="option.disabled"
          class="dropdown-item"
          :class="{ disabled: option.disabled }"
          @click="selectOption(option)"
        >
          {{ option.text }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'
import Icon from '../base/Icon.vue'
interface Option {
  value: string
  text: string
  disabled?: boolean
}

const props = defineProps({
  modelValue: {
    type: String
  },
  options: {
    type: Array<Option>,
    default: () => []
  },
  size: {
    type: String,
    default: 'md'
  },
  variant: {
    type: String,
    default: 'primary'
  },
  right: {
    type: Boolean,
    default: false
  },
  dataTestid: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue', 'input'])

const isOpen = ref(false)

const selectedOption = computed(() => {
  const option = props.options.find(option => option.value === props.modelValue)
  return option ?? props.options?.[0]
})

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  emit('input', option.value)
  isOpen.value = false
}

const dropdownRef = ref()
const buttonRef = ref()

useClickOutside(dropdownRef, () => (isOpen.value = false), buttonRef)
</script>
