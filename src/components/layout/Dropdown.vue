<template>
  <div class="dropdown b-dropdown btn-group" :class="{ show: isOpen }">
    <button aria-haspopup="menu" :aria-expanded="isOpen" type="button" class="btn dropdown-toggle" :class="{
      [`btn-${size}`]: size != undefined,
      [`btn-${variant}`]: variant != undefined,
    }" @click="isOpen = !isOpen" ref="buttonRef">
      {{ selectedOption.text }}
    </button>
    <ul role="menu" tabindex="-1" class="dropdown-menu" :class="{ show: isOpen, 'dropdown-menu-right': right }"
      ref="dropdownRef">
      <li v-for="option in options" :key="option.value" role="presentation">
        <a role="menuitem" target="_self" :aria-disabled="option.disabled" class="dropdown-item"
          :class="{ disabled: option.disabled }" @click="selectOption(option)">
          {{ option.text }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'

interface Option {
  value: string
  text: string
  disabled?: boolean
}

const props = defineProps({
  value: {
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
})

const emit = defineEmits(['update:value', 'input'])

const isOpen = ref(false)

const selectedOption = computed(() => {
  const option = props.options.find(option => option.value === props.value)
  return option ?? props.options?.[0]
})

const selectOption = (option: Option) => {
  emit('update:value', option.value)
  emit('input', option.value);
  isOpen.value = false
}


const dropdownRef = ref()
const buttonRef = ref()

useClickOutside(
  dropdownRef,
  () => isOpen.value = false,
  buttonRef
)
</script>
