<template>
  <b-modal
    scrollable
    centered
    ok-only
    no-close-on-backdrop
    hideHeaderClose
    static
    visible
    id="disclaimerNotice"
    ref="disclaimerNotice"
    :title="content.title"
  >
    <template v-slot:modal-footer>
      <b-button variant="primary" size="sm" @click="agreeTerms()">{{
        $t('actions.agree')
      }}</b-button>
    </template>
    <div style="max-height: 50vh; overflow: scroll">
      <p v-for="(para, i) in content.body" v-bind:key="i" v-html="para" />
    </div>
  </b-modal>
</template>

<script>
import content from '@/assets/disclaimer.json'

export default {
  methods: {
    agreeTerms() {
      this.$store.dispatch('settings/ACCEPT_TERMS_OF_USE')
    },
  },
  computed: {
    content: {
      get() {
        return content[this.activeLanguageCode]
      },
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code
    },
  },
}
</script>
