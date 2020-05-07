<template lang="html">
  <span v-if="content" class="info-button">
    <div class="info-button-trigger icon-link dripicons-information d-inline-block" :id="targetId"
      @click.prevent.stop="togglePopover"></div>
    <b-popover :target="targetId" boundary='window' placement="right" custom-class="drop-shadow">
      <template v-if="content.title" v-slot:title>{{content.title}}</template>
      <div v-if="content.summary" v-html="content.summary" />
      <router-link
        v-if="content.description"
        class="d-block text-right small-caps"
        v-bind:to="{ name: `faq`, hash: `#${content.id}` }">
        {{$t("more_info")}} &rarr;
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
 * <info-button name="which-newspapers" class="ml-2 mt-1 d-inline-block" />
 */
import content from '@/assets/faqpage.json';

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
      return `ib_${this.target || this.name}`;
    },
    content: {
      get() {
        const matches = [];
        content[this.activeLanguageCode].groups.forEach((item) => {
          const found = item.faq && item.faq.find(fa => fa.id === this.name);
          if (found) matches.push(found);
        });
        return matches[0];
      },
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
  },
  methods: {
    togglePopover(status) {
      if (typeof status === 'boolean') {
        this.show = status;
      } else {
        this.show = !!this.show;
      }
      console.info('popover show:', this.show, this.targetId, this.currentTargetId);

      if (this.currentTargetId) {
        if (this.currentTargetId !== this.targetId) {
          this.$root.$emit('bv::hide::popover', this.currentTargetId);
        }
      }
      if (this.show) {
        this.$root.$emit('bv::show::popover', this.targetId);
      }
    },
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

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
  background: $clr-primary;
  color: $clr-white;
  a {
    color: $clr-white;
  }
}
.popover-header {
  font-weight: bold;
  font-style: italic;
  border-bottom: none;
  padding-bottom: 0;
  &::after {
    content: '';
    display: block;
    padding-top: 0.5em;
    border-bottom: 1px solid $clr-tertiary;
  }
}
.bs-popover-top .arrow::after {
  border-top-color: $clr-primary;
}
.bs-popover-bottom .arrow::after {
  border-bottom-color: $clr-primary;
}
.bs-popover-right .arrow::after {
  border-right-color: $clr-primary;
}
.bs-popover-left .arrow::after {
  border-left-color: $clr-primary;
}
</style>
