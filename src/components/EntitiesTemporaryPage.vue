<template>
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light">
        <section class="top-section">
          <h3>{{ $t('title') }}</h3>
        </section>
      </b-navbar>
      <b-navbar class="pt-0 border-top">
      </b-navbar>
    </template>
  </i-layout-section>
</template>

<i18n lang="json">
{
  "en": {
    "title": "Entities"
  }
}
</i18n>
