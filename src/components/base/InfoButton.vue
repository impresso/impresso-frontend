<template>
  <span v-if="content" class="info-button">
    <div
      class="info-button-trigger icon-link dripicons-information d-inline-block"
      :id="targetId"
      @click.prevent.stop="togglePopover"
    ></div>
    <b-popover :target="targetId" boundary="window" placement="right" custom-class="drop-shadow">
      <template v-if="content.title" v-slot:title>{{ content.title }}</template>
      <div v-if="content.summary" v-html="content.summary" />
      <router-link
        v-if="content.description"
        class="d-block text-right small-caps"
        v-bind:to="{ name: `faq`, hash: `#${content.id}` }"
      >
        {{ $t('more_info') }} &rarr;
      </router-link>
    </b-popover>
  </span>
</template>

<script>
/**
 * Usage of this component
 *
 * import InfoButton from './base/InfoButton';
 *
 * in template:
 * <info-button name="who-is-behind-impresso" class="ml-2 mt-1 d-inline-block" />
 *
 * then the name refers to the identifier of the faq item.
 * faqContent is structured as such:
 * "en": {
 *  "title": "FAQ",
 *  "groups": [
 *    {
 *      "title": "About the impresso project",
 *      "faq": [
 *       {
 *          "id": "who-is-behind-impresso",
 */
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

export default {
  props: [
    'target', // optional
    'name', // name = ID required
  ],
  data: () => ({
    show: false,
    currentTargetId: null,
  }),
  computed: {
    targetId() {
      return `ib_${this.target || this.name}`
    },
    /**
     * return an object
     * returns null if no content is found
     */
    content() {
      return FaqContentsMap[this.activeLanguageCode][this.name] || { title: this.name }
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code
    },
  },
  methods: {
    togglePopover(status) {
      if (typeof status === 'boolean') {
        this.show = status
      } else {
        this.show = !!this.show
      }
      console.info('popover show:', this.show, this.targetId, this.currentTargetId)

      if (this.currentTargetId) {
        if (this.currentTargetId !== this.targetId) {
          this.$root.$emit('bv::hide::popover', this.currentTargetId)
        }
      }
      if (this.show) {
        this.$root.$emit('bv::show::popover', this.targetId)
      }
    },
  },
}
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
