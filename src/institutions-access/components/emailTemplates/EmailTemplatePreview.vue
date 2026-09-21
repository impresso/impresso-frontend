<template>
  <div class="EmailTemplatePreview">
    <div class="EmailTemplatePreview__envelope">
      <pre class="EmailTemplatePreview__fixed">{{ envelope.before }}</pre>
      <div v-if="showCustomSlot" class="EmailTemplatePreview__slot">
        <div class="EmailTemplatePreview__slotLabel">{{ $t('customSlot') }}</div>
        <div v-if="hasHtml" class="EmailTemplatePreview__html" v-html="body"></div>
        <pre v-else class="EmailTemplatePreview__text">{{ body }}</pre>
      </div>
      <p v-else class="EmailTemplatePreview__omitted">{{ $t('omitted') }}</p>
      <pre class="EmailTemplatePreview__fixed">{{ envelope.after }}</pre>
    </div>
    <p class="very-small text-muted mt-2 mb-0">{{ $t('disclaimer') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AutoReplyEnvelope } from '../../services/emailTemplates'

export interface EmailTemplatePreviewProps {
  body: string
  enabled?: boolean
}

const props = withDefaults(defineProps<EmailTemplatePreviewProps>(), {
  enabled: true
})

const envelope = AutoReplyEnvelope

const showCustomSlot = computed(() => props.enabled && props.body.trim() !== '')

const hasHtml = computed(() => /<\/?[a-z][\s\S]*>/i.test(props.body))
</script>

<i18n lang="json">
{
  "en": {
    "customSlot": "Your custom message",
    "omitted": "No custom message will be inserted.",
    "disclaimer": "This is the auto-reply sent when someone requests access. The greeting, request details and signature cannot be edited."
  }
}
</i18n>

<style>
.EmailTemplatePreview__envelope {
  border: 1px solid var(--clr-grey-500);
  border-radius: var(--impresso-border-radius-sm);
  background-color: var(--impresso-color-white);
  overflow: hidden;
}
.EmailTemplatePreview__fixed {
  margin: 0;
  padding: 0.9rem 1rem;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--clr-grey-300);
  background-color: var(--impresso-color-light-grey);
}
.EmailTemplatePreview__slot {
  padding: 0.9rem 1rem;
  border-top: 1px dashed var(--clr-grey-600);
  border-bottom: 1px dashed var(--clr-grey-600);
}
.EmailTemplatePreview__slotLabel {
  margin-bottom: 0.4rem;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--clr-grey-300);
}
.EmailTemplatePreview__text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.9rem;
}
.EmailTemplatePreview__html {
  font-size: 0.9rem;
}
.EmailTemplatePreview__html > :last-child {
  margin-bottom: 0;
}
.EmailTemplatePreview__omitted {
  margin: 0;
  padding: 0.9rem 1rem;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--clr-grey-300);
  border-top: 1px dashed var(--clr-grey-600);
  border-bottom: 1px dashed var(--clr-grey-600);
}
</style>
