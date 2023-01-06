<template>
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light" class="border-bottom">
        <section class="pt-2 pb-1">
          <span class="label small-caps">{{ $t('textReuse') }}</span>
          <small><info-button name="which-text-reuse" class="text-muted"/></small>
          <h3 class="mb-1">...</h3>
        </section>
      </b-navbar>
    </template>
  </i-layout-section>
</template>

<script>
import InfoButton from './base/InfoButton'

export default {
  components: {
    InfoButton,
  },
}
</script>
<i18n>
  {
    "en": {
      "textReuse": "overview"
    }
  }
  </i18n>
