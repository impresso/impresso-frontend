<template>
  <li class="nav-item">
    <router-link
      v-if="shouldUseRouterLink"
      :to="props.to"
      :exact="props.exact"
      :active-class="props.activeClass"
      class="nav-link"
      v-on="$listeners"
    >
      <slot></slot>
    </router-link>
    <a v-else :class="linkClasses" :href="href" target="_self" v-on="$listeners">
      <slot></slot>
    </a>
  </li>
</template>

<script setup lang="ts">
/**
 * @deprecated Use pure Bootstrap CSS instead
 */

import { computed, useAttrs, getCurrentInstance } from 'vue'
import {} from 'vue-router'

const props = defineProps({
  to: {
    type: Object,
  },
  exact: {
    type: Boolean,
    default: false,
  },
  isRouterLink: {
    type: Boolean,
    default: true,
  },
  activeClass: {
    type: String,
    default: 'active',
  },
  active: Boolean,
})
const attrs = useAttrs()

const router = getCurrentInstance()?.proxy.$router
const route = getCurrentInstance()?.proxy.$route
const routeBaseRegex = new RegExp(`^${route?.options?.base}`)

const allowedAttrs = ['onClick', 'title', 'id']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BNavItem: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const shouldUseRouterLink = computed(() => {
  return props.isRouterLink && props.to && router != null
})

const href = computed(() => {
  if (props.to && router != null) {
    const { href } = router.resolve(props.to)
    return href
  }
  return undefined
})

const linkClasses = computed(() => {
  if (!href)
    return {
      'nav-link': true,
      // manually set active class
      [String(props.activeClass)]: props.active,
    }

  const baselessHref = href.value?.replace(routeBaseRegex, '/') || ''
  // const baselessHref = href.value?.replace(router?.base,'')
  const isSameRoute = props.exact
    ? route?.fullPath === baselessHref
    : route?.fullPath.startsWith(baselessHref)

  return {
    'nav-link': true,
    [String(props.activeClass)]: props.active || isSameRoute,
  }
})
</script>
