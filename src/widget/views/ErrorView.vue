<template>
  <div class="ErrorView h-100 d-flex align-items-center justify-content-center p-3" role="alert">
    <div class="ErrorView__message">
      <p class="mb-1 fw-bold">{{ $t(`title.${props.errorType}`) }}</p>
      <p class="mb-0 small text-muted">{{ $t(`description.${props.errorType}`) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ErrorViewProps {
  errorType?: 'notFound' | 'validation'
}

const props = withDefaults(defineProps<ErrorViewProps>(), {
  errorType: 'notFound'
})
</script>

<style>
.ErrorView__message {
  max-width: 28rem;
  padding: 1rem 1.5rem;
  text-align: center;
  background-color: var(--clr-white, #fff);
  border-radius: var(--impresso-border-radius-sm, 4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
</style>

<i18n lang="json">
{
  "en": {
    "title": {
      "notFound": "Nothing to show here",
      "validation": "Invalid embed link"
    },
    "description": {
      "notFound": "This Impresso widget link does not point to any content item.",
      "validation": "Some parameters of this embed link are not valid. Please generate a new embed code from Impresso."
    }
  }
}
</i18n>
