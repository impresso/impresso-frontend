<template>
  <li role="presentation">
    <a role="menuitem" :class="linkClasses" :href="href" :target="props.target" :aria-disabled="disabled ? true : undefined" v-bind="$attrs" @click="onClick">
      <slot></slot>
    </a>
  </li>
</template>

<script setup lang="ts">
/**
 * @deprecated Use pure Bootstrap CSS instead
 */

import { computed, useAttrs, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

interface WithHide {
  hide: (force?: boolean) => void
}

const props = defineProps({
  to: {
    type: Object
  },
  activeClass: String,
  disabled: Boolean,
  active: Boolean,
  target: {
    type: String,
    default: '_self'
  },
  href: String
})
const attrs = useAttrs()

const router = useRouter()
const route = router.currentRoute

// NOTE: There seems to be no easy way to get $parent in Vue 3
const parent = getCurrentInstance()?.proxy?.$parent

const onClick = () => {
  if ((parent as any as WithHide)?.hide) {
    const el = parent as any as WithHide
    el.hide(true)
  }
}

const allowedAttrs = ['onClick', 'title', 'id', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BDropdownItem: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const href = computed(() => {
  if (props.href != null) return props.href
  if (props.to && router != null) {
    const { href } = router.resolve(props.to)
    return href
  }
  return undefined
})

const linkClasses = computed(() => ({
  'dropdown-item': true,
  [String(props.activeClass)]: props.active || href.value === route.value?.fullPath,
  'disabled': props.disabled
}))
</script>
