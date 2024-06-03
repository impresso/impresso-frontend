<template>
  <div ref="rootRef">
    <ul ref="ulRef" v-bind="$attrs" :class="tabsClass" v-on="$listeners">
      <slot name="tabs-start"></slot>
      <slot name="tabs-end"></slot>
    </ul>
    <div class="tab-content" :class="contentClass">
      <slot name="default"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, onMounted, ref, reactive } from 'vue'

const props = defineProps({
  pills: {
    type: Boolean,
    default: false,
  },
  contentClass: String
})
const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BTabs: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const rootClasses = reactive({
  classes: {}
})

const tabsClass = computed(() => ({
  'nav': true,
  'nav-pills': props.pills,
  ...rootClasses.classes
}))

const rootRef = ref<HTMLElement | null>(null)
const ulRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const classes = rootRef.value?.getAttribute("class")
  rootRef?.value?.removeAttribute("class")
  rootClasses.classes = classes?.split(' ')?.reduce((acc, item) => {
    acc[item] = true
    return acc
  }, {}) ?? {}
})

</script>
