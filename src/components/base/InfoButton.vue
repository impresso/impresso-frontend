<template lang="html">
  <span v-if="content" class="info-button">
    <span class="icon-link dripicons-information" :id="`ib_${target || name}`"></span>
    <b-popover :target="`ib_${target || name}`" triggers="hover click blur" placement="right" custom-class="drop-shadow">
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
import content from '@/assets/faqpage.json';

export default {
  props: [
    'target', // optional
    'name', // name = ID required
  ],
  computed: {
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
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.popover {
  border: none;
}
.popover-header,
.popover-body {
  max-width: 185px;
  background: $clr-primary;
  color: $clr-white;
  a {
    color: $clr-white;
  }
}
.popover-header {
  font-weight: bold;
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
