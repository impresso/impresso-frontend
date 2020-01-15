<template>
  <main class="container py-5">
    <b-row class="justify-content-md-center">
      <b-col col xl="6" lg="8" md="10">
        <h1 class="mb-4">{{content.title}}</h1>
        <p v-for="(paragraph, i) in content.body" v-bind:key="i" v-html="paragraph" />
      </b-col>
    </b-row>
  </main>
</template>

<script>
import content from '@/assets/disclaimer.json';

export default {
  methods: {
    agreeTerms() {
      this.$store.dispatch('settings/ACCEPT_TERMS_OF_USE');
    },
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

<style lang="scss">
</style>
