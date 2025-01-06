<template>
  <a href="#" class="TermsOfUseModalLink" @click="handleClick">
    <slot>{{ $t('Terms of Use') }}</slot>
  </a>
</template>

<script setup lang="ts">
import { useViewsStore, ViewTermsOfUse } from '@/stores/views'

const handleClick = (event: MouseEvent) => {
  event.preventDefault()
  useViewsStore().view = ViewTermsOfUse
}
</script>
<i18n>
  {
    "en": {
      "Terms of Use": "Terms of Use"
    }
  }
</i18n>
