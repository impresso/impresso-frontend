<template>
  <div v-if="content" class="InfoButton d-inline">
    <div
      class="info-button-trigger icon-link dripicons-information d-inline-block"
      ref="reference"
      @click.prevent.stop="togglePopover"
    ></div>
    <div
      v-if="show"
      ref="floating"
      role="tooltip"
      tabindex="-1"
      class="popover b-popover bs-popover-right drop-shadow bg-dark"
      :style="floatingStyles"
    >
      <div class="position-absolute" ref="floatingArrow" :style="floatingArrowStyles"></div>
      <h3 class="popover-header" v-if="content.title">
        {{ content.title }}
      </h3>

      <div class="popover-body pt-1 text-right">
        <div class="text-left" v-if="content.summary" v-html="content.summary" />
        <router-link
          v-if="content.description"
          class="btn-rounded mt-2 btn btn-outline-secondary btn-sm"
          v-bind:to="{ name: `faq`, hash: `#${content.id}` }"
        >
          {{ $t('more_info') }} &rarr;
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { arrow, useFloating } from '@floating-ui/vue'
import { useClickOutside } from '@/composables/useClickOutside'
import { useSettingsStore } from '@/stores/settings'
import faqContent from '@/assets/faqpage.json'

type MiddlewareData = {
  arrow?: {
    x: number
    y: number
  }
}
// flatten down the faqContent object to get a dict like {language : { id : <item> } }
const FaqContentsMap = Object.entries(faqContent).reduce((acc, [language, item]) => {
  acc[language] = item.groups.reduce((acc, group) => {
    group.faq.forEach(faq => {
      acc[faq.id] = faq
    })
    return acc
  }, {})
  return acc
}, {})

const reference = ref(null)
const floating = ref(null)
const floatingArrow = ref(null)

const props = defineProps({
  target: String,
  name: {
    type: String,
    required: true
  },
  placement: {
    type: String,
    default: 'right'
  }
})

const { floatingStyles, middlewareData } = useFloating(reference, floating, {
  placement: props.placement as any,
  middleware: [arrow({ element: floatingArrow })]
})

// const floatingStyles = computed(() => ({
//   top: `${y.value}px`,
//   left: `${x.value}px`,
//   position: strategy.value
// }))

const floatingArrowStyles = computed(() => {
  const m = middlewareData as unknown as MiddlewareData
  return {
    left: m.arrow?.x != null ? `${m.arrow.x}px` : '',
    top: m.arrow?.y != null ? `${m.arrow.y}px` : ''
  }
})

const show = ref(false)

const store = useSettingsStore()
const activeLanguageCode = computed(() => store.language_code)
const content = computed(
  () => FaqContentsMap[activeLanguageCode.value][props.name] || { title: props.name }
)

const togglePopover = () => (show.value = !show.value)

useClickOutside(floating, () => (show.value = false), reference)
</script>

<style lang="css">
.info-button-trigger {
  font-size: 16px;
}

.InfoButton .popover {
  border: none;
  pointer-events: none;
  border-radius: var(--impresso-border-radius-sm);
  overflow: hidden;
}

.InfoButton .popover-header,
.InfoButton .popover-body {
  pointer-events: auto;
  padding: var(--spacing-2-5);
  max-width: 185px;
  background-color: var(--impresso-color-black) !important;
  color: var(--impresso-color-paper) !important;
}
.InfoButton .popover-header a,
.InfoButton .popover-body a {
  color: var(--impresso-color-paper);
}

.InfoButton .popover-header {
  /* font-weight: bold; */
  font-style: italic;
  border-bottom: none !important;
  padding-bottom: 0;
  font-family: var(--bs-font-sans-serif-italic);
  font-weight: var(--impresso-wght-medium);
  font-variation-settings: 'wght' var(--impresso-wght-medium);
}
.InfoButton .popover-header::after {
  content: '';
  display: block;
  padding-top: 0.5em;
}
.InfoButton .bs-popover-top .arrow {
  background-color: var(--impresso-color-black) !important;
}
.InfoButton .bs-popover-top .arrow::after {
  border-top-color: var(--impresso-color-black) !important;
}
.InfoButton .bs-popover-bottom .arrow::after {
  border-bottom-color: var(--impresso-color-black) !important;
}
.InfoButton .bs-popover-right .arrow::after {
  border-right-color: var(--impresso-color-black) !important;
}
.InfoButton .bs-popover-left .arrow::after {
  border-left-color: var(--impresso-color-black) !important;
}
</style>
