<template>
  <div class="EmailTemplateEditor">
    <div class="row gy-4">
      <div class="col-12 col-xl-6">
        <form @submit.prevent="save">
          <BFormCheckbox
            switch
            class="mb-3"
            :modelValue="form.enabled"
            @update:modelValue="value => (form.enabled = Boolean(value))"
          >
            {{ $t('enabled') }}
          </BFormCheckbox>

          <div class="mb-2">
            <label class="form-label small font-weight-bold">{{ $t('bodyLabel') }}</label>
            <HtmlCodeEditor
              :model-value="form.body"
              :disabled="isSaving"
              @update:model-value="value => (form.body = value)"
            />
            <div class="small text-muted mt-1">
              <span v-if="bodyError" class="text-danger">{{ $t(bodyError) }}</span>
              <span v-else>{{ $t('bodyHint') }}</span>
            </div>
          </div>

          <div class="d-flex gap-2 align-items-center flex-wrap">
            <button
              type="submit"
              class="btn btn-outline-secondary btn-md px-4 border border-dark"
              :disabled="!isDirty || isSaving || hasErrors"
            >
              {{ $t(isSaving ? 'actions.saving' : 'actions.save') }}
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-md px-4 border border-dark"
              :disabled="!isDirty || isSaving"
              @click="reset"
            >
              {{ $t('actions.reset') }}
            </button>
            <span v-if="isDirty" class="small text-muted">{{ $t('unsavedChanges') }}</span>
            <span v-else class="very-small text-muted EmailTemplateEditor__saved">
              {{ $t('lastModified', { date: lastModifiedLabel }) }}
            </span>
          </div>
        </form>
      </div>

      <div class="col-12 col-xl-6">
        <h3 class="small-caps text-muted h6 mb-2">{{ $t('previewLabel') }}</h3>
        <EmailTemplatePreview :body="form.body" :enabled="form.enabled" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import BFormCheckbox from '@/components/legacy/bootstrap/BFormCheckbox.vue'
import HtmlCodeEditor from './HtmlCodeEditor.vue'
import EmailTemplatePreview from './EmailTemplatePreview.vue'
import type { EmailTemplate } from '../../services/emailTemplates'

export interface EmailTemplateEditorProps {
  template: EmailTemplate
  isSaving?: boolean
  bodyMaxLength?: number
}

const props = withDefaults(defineProps<EmailTemplateEditorProps>(), {
  isSaving: false,
  bodyMaxLength: 5000
})

const emit = defineEmits<{
  (e: 'save', payload: Pick<EmailTemplate, 'body' | 'enabled'>): void
  (e: 'update:isDirty', value: boolean): void
}>()

const form = reactive({
  body: props.template.body,
  enabled: props.template.enabled
})

const reset = () => {
  form.body = props.template.body
  form.enabled = props.template.enabled
}

watch(() => props.template, reset)

const isDirty = computed(
  () => form.body !== props.template.body || form.enabled !== props.template.enabled
)

watch(isDirty, value => emit('update:isDirty', value), { immediate: true })

const bodyError = computed(() => {
  if (form.body.length > props.bodyMaxLength) return 'bodyTooLong'
  return ''
})

const hasErrors = computed(() => bodyError.value !== '')

const lastModifiedLabel = computed(() =>
  new Date(props.template.dateLastModified).toLocaleDateString()
)

const save = () => {
  if (hasErrors.value) return
  emit('save', { body: form.body, enabled: form.enabled })
}

defineExpose({ isDirty })
</script>

<i18n lang="json">
{
  "en": {
    "enabled": "Insert this custom message into the email",
    "bodyLabel": "Custom message",
    "bodyHint": "Plain text or basic HTML. The greeting and signature are part of the Impresso email and cannot be edited here.",
    "previewLabel": "Preview in the email",
    "unsavedChanges": "You have unsaved changes.",
    "lastModified": "Last saved on {date}",
    "bodyTooLong": "The message is too long.",
    "actions": {
      "save": "Save message",
      "saving": "Saving...",
      "reset": "Discard changes"
    }
  }
}
</i18n>

<style>
.EmailTemplateEditor__saved {
  font-variant-numeric: tabular-nums;
}
</style>
