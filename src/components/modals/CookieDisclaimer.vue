<template lang="html">
  <div class="cookie-disclaimer" v-if="!cookiesAccepted">
    <div class="d-flex p-4">
      <div class="flex-grow-1">
        This website uses cookies to ensure you get the best experience on our website.
        <a target="_blank" href="https://www.cookiesandyou.com/">Learn more</a>
      </div>
      <b-button variant="primary" size="sm" @click="accept()">{{ $t('actions.accept') }}</b-button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    accept() {
      this.$store.dispatch('settings/ACCEPT_COOKIES');
    },
  },
  computed: {
    cookiesAccepted() {
      return this.$store.state.settings.cookiesAccepted;
    },
  },
};
</script>

<style lang="css" scoped>
.cookie-disclaimer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFEB78;
  z-index: 1090;
  padding-right: 80px;
}

.cookie-disclaimer a {
  text-decoration: underline;;
}
</style>
