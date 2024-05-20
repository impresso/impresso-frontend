<template>
  <li class="nav-item">
    <a :class="linkClasses" :href="href" target="_self" v-on="$listeners">
      <slot></slot>
    </a>
  </li>
</template>

<script setup lang="ts">
/**
 * @deprecated Use pure Bootstrap CSS instead
 */

import { computed, useAttrs, getCurrentInstance } from 'vue'
import {  } from 'vue-router'

const props = defineProps({
  to: {
    type: Object
  },
  activeClass: {
    type: String,
    default: 'active'
  },
  active: Boolean
})
const attrs = useAttrs()

const router = getCurrentInstance()?.proxy.$router
const route = getCurrentInstance()?.proxy.$route

const allowedAttrs = ['onClick', 'title', 'id']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BNavItem: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const href = computed(() => {
  if (props.to && router != null) {
    const { href } = router.resolve(props.to)
    return href
  }
  return undefined
})

const linkClasses = computed(() => ({
  'nav-link': true,
  [String(props.activeClass)]: props.active || href.value === route?.fullPath
}))
</script>
