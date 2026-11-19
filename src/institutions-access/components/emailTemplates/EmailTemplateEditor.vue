<template>
  <div class="EmailTemplateEditor">
    <div class="EmailTemplateEditor__toggle">
      <BFormCheckbox
        switch
        class="InstitutionsAccessSwitch"
        :model-value="modelValue.enabled"
        @update:model-value="value => patch({ enabled: Boolean(value) })"
      >
        <span class="EmailTemplateEditor__toggleTitle">{{ $t('enabled') }}</span>
        <span class="EmailTemplateEditor__toggleHint">{{ $t('enabledHint') }}</span>
      </BFormCheckbox>
    </div>

    <div class="EmailTemplateEditor__grid">
      <div class="EmailTemplateEditor__composer" :class="{ 'is-off': !modelValue.enabled }">
        <label class="small-caps EmailTemplateEditor__label">{{ $t('bodyLabel') }}</label>
        <HtmlCodeEditor
          :model-value="modelValue.body"
          :disabled="disabled || !modelValue.enabled"
          @update:model-value="value => patch({ body: value })"
        />
        <p class="EmailTemplateEditor__hint" :class="{ 'is-error': isBodyTooLong }">
          {{ $t(isBodyTooLong ? 'bodyTooLong' : 'bodyHint') }}
        </p>
      </div>

      <div class="EmailTemplateEditor__preview">
        <p class="small-caps EmailTemplateEditor__previewKicker">{{ $t('previewLabel') }}</p>
        <EmailTemplatePreview :body="modelValue.body" :enabled="modelValue.enabled" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BFormCheckbox from '@/components/legacy/bootstrap/BFormCheckbox.vue'
import HtmlCodeEditor from './HtmlCodeEditor.vue'
import EmailTemplatePreview from './EmailTemplatePreview.vue'
import { EmailBodyMaxLength, type EmailTemplate } from '../../services/emailTemplates'

export interface EmailTemplateEditorProps {
  modelValue: EmailTemplate
  disabled?: boolean
}

const props = withDefaults(defineProps<EmailTemplateEditorProps>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: EmailTemplate): void
}>()

const patch = (partial: Partial<EmailTemplate>) => {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}

const isBodyTooLong = computed(() => props.modelValue.body.length > EmailBodyMaxLength)
</script>

<i18n lang="json">
{
  "en": {
    "enabled": "Add a custom message to the auto-reply",
    "enabledHint": "Turn off to send the standard Impresso email only. Saving while off removes your text.",
    "bodyLabel": "Custom message",
    "bodyHint": "Plain text or basic HTML. The greeting and signature stay in the Impresso email.",
    "previewLabel": "In the email",
    "bodyTooLong": "The message is too long."
  }
}
</i18n>

<style>
.EmailTemplateEditor__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.75rem 2rem;
  align-items: start;
}
.EmailTemplateEditor__composer {
  min-width: 0;
}
.EmailTemplateEditor__toggle {
  margin-bottom: 1.25rem;
  padding: 0.95rem 1rem;
  border: 1px solid var(--clr-grey-600);
  border-radius: var(--impresso-border-radius-xs);
}
.EmailTemplateEditor__toggleTitle {
  display: block;
  font-weight: 550;
  font-variation-settings: 'wght' 550;
  letter-spacing: -0.01em;
}
.EmailTemplateEditor__toggleHint {
  display: block;
  margin-top: 0.2rem;
  color: var(--clr-grey-300);
  font-size: 0.85rem;
  line-height: 1.45;
}
.EmailTemplateEditor__composer.is-off {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}
.EmailTemplateEditor__label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--clr-grey-300);
}
.EmailTemplateEditor__hint {
  margin: 0.45rem 0 0;
  max-width: 58ch;
  color: var(--clr-grey-300);
  font-size: 0.8rem;
  line-height: 1.45;
  text-wrap: pretty;
}
.EmailTemplateEditor__hint.is-error {
  color: var(--impresso-color-black);
  font-weight: 550;
  font-variation-settings: 'wght' 550;
}
.EmailTemplateEditor__previewKicker {
  margin: 0 0 0.55rem;
  color: var(--clr-grey-300);
}
.EmailTemplateEditor__preview {
  min-width: 0;
}
@media (min-width: 1200px) {
  .EmailTemplateEditor__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .EmailTemplateEditor__preview {
    position: sticky;
    top: 1rem;
  }
}
</style>
