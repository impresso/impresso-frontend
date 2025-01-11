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

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { computed } from 'vue'

const settingsStore = useSettingsStore()
const cookiesAccepted = computed(() => settingsStore.cookiesAccepted)

console.debug('[CookieDisclaimer] cookiesAccepted:', cookiesAccepted.value)

const accept = () => {
  settingsStore.setCookiesAccepted(true)
  const glob: any = window
  if (glob._paq) {
    console.info('[CookieDisclaimer] Matomo: Remembering cookie consent was given')
    // accept matomo cookies
    glob._paq.push(['rememberConsentGiven'])
    // OR remember cookie consent was given for all subsequent page views and visits
    glob._paq.push(['rememberCookieConsentGiven'])
  } else {
    console.warn('[CookieDisclaimer] Matomo: _paq not found in Window')
  }
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
