<template>
  <li class="nav-item">
    <router-link
      v-if="routerLinkReady"
      :to="props.to"
      :exact="props.exact"
      :active-class="props.activeClass"
      :active="props.active"
      class="nav-link"
      v-bind="$attrs"
    >
      <slot></slot>
    </router-link>
    <template v-else>
      <slot></slot>
    </template>
  </li>
</template>

<script setup lang="ts">
/**
 * @deprecated Use pure Bootstrap CSS instead
 */

import { useAttrs } from 'vue'
import { useRouter } from 'vue-router'

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

const router = useRouter()

const allowedAttrs = ['onClick', 'title', 'id', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BNavItem: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const routerLinkReady = props.to && router != null
</script>
