<template>
  <li role="presentation">
    <a
      role="menuitem"
      :class="linkClasses"
      :href="href"
      :target="props.target"
      :aria-disabled="disabled ? true : undefined"
      v-bind="nonListenerAttrs"
      @click.stop.prevent="handleClick"
    >
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

// Parent listeners must not fall through onto the root <li> in addition to
// the <a> - that used to fire @click handlers twice per press.
defineOptions({ inheritAttrs: false })

interface WithHide {
  hide: (force?: boolean) => void
}

type ClickHandler = (e: MouseEvent) => void

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
const route = router?.currentRoute

// NOTE: There seems to be no easy way to get $parent in Vue 3
const parent = getCurrentInstance()?.proxy?.$parent

/**
 * Strip listener attrs so we invoke the parent @click exactly once from
 * handleClick. Merging attrs.onClick with a local @click can otherwise
 * produce duplicate invocations depending on Vue's listener merge.
 */
const nonListenerAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on')) continue
    result[key] = value
  }
  return result
})

function invokeParentClick(event: MouseEvent) {
  const handler = attrs.onClick as ClickHandler | ClickHandler[] | undefined
  if (!handler) return
  if (Array.isArray(handler)) {
    // If Vue ever merges duplicates, still only run each unique fn once.
    const seen = new Set<ClickHandler>()
    for (const fn of handler) {
      if (typeof fn !== 'function' || seen.has(fn)) continue
      seen.add(fn)
      fn(event)
    }
    return
  }
  if (typeof handler === 'function') handler(event)
}

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  invokeParentClick(event)
  const hideable = parent as unknown as WithHide | undefined
  if (hideable?.hide) hideable.hide(true)
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
  [String(props.activeClass)]: props.active || href.value === route?.value?.fullPath,
  disabled: props.disabled
}))
</script>
