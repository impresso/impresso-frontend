<template>
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
import { mapStores } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

export default {
  methods: {
    accept() {
      this.settingsStore.setCookiesAccepted(true)
      if (window._paq) {
        console.info('[CookieDisclaimer] Matomo: Remembering cookie consent was given')
        // accept matomo cookies
        _paq.push(['rememberConsentGiven'])
        // OR remember cookie consent was given for all subsequent page views and visits
        _paq.push(['rememberCookieConsentGiven'])
      } else {
        console.warn('[CookieDisclaimer] Matomo: _paq not found')
      }
    },
  },
  computed: {
    ...mapStores(useSettingsStore),
    cookiesAccepted() {
      return this.settingsStore.cookiesAccepted
    },
  },
}
</script>

<style lang="css" scoped>
.cookie-disclaimer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffeb78;
  z-index: 1090;
  padding-right: 80px;
}

.cookie-disclaimer a {
  text-decoration: underline;
}
</style>
