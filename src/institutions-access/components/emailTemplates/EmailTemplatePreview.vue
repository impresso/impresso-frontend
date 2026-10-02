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
    "customSlot": "Your paragraph",
    "omitted": "This paragraph is turned off, so it will not appear in the email.",
    "disclaimer": "Greeting, request details and signature stay in the Impresso auto-reply."
  }
}
</i18n>

<style>
.EmailTemplatePreview__envelope {
  overflow: hidden;
  border: 1px solid var(--clr-grey-600);
  border-radius: var(--impresso-border-radius-xs);
  background-color: var(--impresso-color-paper);
  box-shadow:
    0 1px 0 rgba(45, 41, 38, 0.06),
    0 18px 32px -24px rgba(45, 41, 38, 0.28);
}
.EmailTemplatePreview__fixed {
  margin: 0;
  padding: 1.15rem 1.2rem;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--clr-grey-300);
}
.EmailTemplatePreview__slot {
  margin: 0 0.85rem;
  padding: 0.95rem 1.05rem 1.05rem;
  background-color: var(--impresso-color-white);
  border: 1px dashed var(--clr-grey-500);
  border-radius: var(--impresso-border-radius-xs);
}
.EmailTemplatePreview__slotLabel {
  margin-bottom: 0.45rem;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--clr-grey-300);
}
.EmailTemplatePreview__text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.92rem;
  line-height: 1.5;
}
.EmailTemplatePreview__html {
  font-size: 0.92rem;
  line-height: 1.5;
}
.EmailTemplatePreview__html > :last-child {
  margin-bottom: 0;
}
.EmailTemplatePreview__omitted {
  margin: 0 0.85rem;
  padding: 0.95rem 1.05rem;
  font-size: 0.88rem;
  font-style: italic;
  line-height: 1.5;
  color: var(--clr-grey-300);
  background-color: var(--impresso-color-white);
  border: 1px dashed var(--clr-grey-500);
  border-radius: var(--impresso-border-radius-xs);
}
.EmailTemplatePreview .very-small {
  max-width: 52ch;
  line-height: 1.45;
  text-wrap: pretty;
}
</style>
