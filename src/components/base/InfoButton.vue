<template>
  <span v-if="content" class="info-button">
    <div
      class="info-button-trigger icon-link dripicons-information d-inline-block"
      ref="reference"
      @click.prevent.stop="togglePopover"
    >
    </div>
    <div
      v-if="show"
      ref="floating"
      role="tooltip"
      tabindex="-1"
      class="popover b-popover bs-popover-right drop-shadow"
      :style="floatingStyles">
      <div class="arrow" style="top: 83px;"></div>
      <h3 class="popover-header" v-if="content.title" >
        {{ content.title }}
      </h3>

      <div class="popover-body">
        <div v-if="content.summary" v-html="content.summary" />
        <router-link
          v-if="content.description"
          class="d-block text-right small-caps"
          v-bind:to="{ name: `faq`, hash: `#${content.id}` }"
        >
          {{ $t('more_info') }} &rarr;
        </router-link>
      </div>
    </div>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFloating } from '@floating-ui/vue';
import { useClickOutside } from '@/composables/useClickOutside'
import { useSettingsStore } from '@/stores/settings'

import faqContent from '@/assets/faqpage.json'

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

const reference = ref(null);
const floating = ref(null);
const { floatingStyles } = useFloating(reference, floating, {
  placement: 'right',
});

const props = defineProps({
  target: String,
  name: {
    type: String,
    required: true,
  },
})


const show = ref(false)

const store = useSettingsStore()
const activeLanguageCode = computed(() => store.language_code)
const content = computed(() => FaqContentsMap[activeLanguageCode.value][props.name] || { title: props.name })


const togglePopover = () => show.value = !show.value

useClickOutside(
  floating,
  () => show.value = false,
  reference
)
</script>

<style lang="scss">
@import 'impresso-theme/src/scss/variables.sass';

.info-button-trigger {
  font-size: 16px;
}

.popover {
  border: none;
  pointer-events: none;
}

.popover-header,
.popover-body {
  pointer-events: auto;
  max-width: 185px;
  background-color: $clr-primary !important;
  color: $clr-white !important;
  a {
    color: $clr-white;
  }
}

.popover-header {
  font-weight: bold;
  font-style: italic;
  border-bottom: none !important;
  padding-bottom: 0;
  font-family: 'questa', serif;
  &::after {
    content: '';
    display: block;
    padding-top: 0.5em;
  }
}
.bs-popover-top .arrow {
  background-color: $clr-primary !important;
}
.bs-popover-top .arrow::after {
  border-top-color: $clr-primary !important;
}
.bs-popover-bottom .arrow::after {
  border-bottom-color: $clr-primary !important;
}
.bs-popover-right .arrow::after {
  border-right-color: $clr-primary !important;
}
.bs-popover-left .arrow::after {
  border-left-color: $clr-primary !important;
}
</style>
