<template>
  <li class="nav-item">
    <router-link
      v-if="routerLinkReady"
      :to="props.to"
      :exact="props.exact"
      :active-class="props.activeClass"
      class="nav-link"
      v-on="$listeners"
    >
      <slot></slot>
    </router-link>
  </li>
</template>

<script setup lang="ts">
/**
 * @deprecated Use pure Bootstrap CSS instead
 */

import { useAttrs, getCurrentInstance } from 'vue'
import {} from 'vue-router'

const props = defineProps({
  to: {
    type: Object,
  },
  exact: {
    type: Boolean,
    default: false,
  },
  activeClass: {
    type: String,
    default: 'active',
  },
  active: Boolean,
})
const attrs = useAttrs()

const router = getCurrentInstance()?.proxy.$router

const allowedAttrs = ['onClick', 'title', 'id']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BNavItem: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const routerLinkReady = props.to && router != null
</script>
