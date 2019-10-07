<template lang="html">
  <b-modal scrollable ok-only no-close-on-backdrop
    id="disclaimerNotice"
    ref="disclaimerNotice"
    :title="content.title">
    <template v-slot:modal-ok>
      {{content.buttons.agree}}
    </template>
    <p
      v-for="(para, i) in content.body"
      v-bind:key="i"
      v-html="para" />
  </b-modal>
</template>

<script>
import content from '@/assets/disclaimer.json';

export default {
  mounted() {
    if (localStorage.getItem('terms_agreed') !== true) {
      this.$refs.disclaimerNotice.show();
    }
    this.$root.$on('bv::modal::hide', () => {
      localStorage.setItem('terms_agreed', true);
    });
  },
  computed: {
    content: {
      get() {
        return content[this.activeLanguageCode];
      },
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
  },
};
</script>
