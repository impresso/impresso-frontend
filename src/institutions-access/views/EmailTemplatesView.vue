<template>
  <div class="container EmailTemplatesView">
    <header class="InstitutionsAccessPageHeader">
      <h1>{{ $t('pageTitle') }}</h1>
      <p>{{ $t('pageSubtitle') }}</p>
      <p class="InstitutionsAccessPageHeader__note">{{ $t('mockNotice') }}</p>
    </header>

    <Card>
      <template #header>
        <h2 class="small-caps m-0">{{ $t('cardTitle') }}</h2>
      </template>
      <LoadingBlock v-if="isLoading" :height="400" />
      <Alert v-else-if="loadError" type="warning" :closable="false">
        {{ $t('loadError') }}
      </Alert>
      <EmailTemplateEditor
        v-else-if="template"
        :template="template"
        :is-saving="isSaving"
        @save="saveTemplate"
        @update:is-dirty="value => (hasUnsavedChanges = value)"
      />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import Alert from 'impresso-ui-components/components/Alert.vue'
import Card from '../components/Card.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import EmailTemplateEditor from '../components/emailTemplates/EmailTemplateEditor.vue'
import {
  AutoReplyTemplateId,
  emailTemplatesClient,
  type EmailTemplate,
  type EmailTemplatesClient
} from '../services/emailTemplates'
import { useNotificationsStore } from '@/stores/notifications'

export interface EmailTemplatesViewProps {
  /** Injectable client, so stories can exercise the HTTP implementation. */
  client?: EmailTemplatesClient
}

const props = withDefaults(defineProps<EmailTemplatesViewProps>(), {
  client: () => emailTemplatesClient
})

const notificationsStore = useNotificationsStore()

const template = ref<EmailTemplate | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const loadError = ref(false)
const hasUnsavedChanges = ref(false)

const loadTemplate = async () => {
  isLoading.value = true
  loadError.value = false
  try {
    template.value = await props.client.get(AutoReplyTemplateId)
  } catch (error) {
    console.error('[EmailTemplatesView] Failed to load template', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

const confirmDiscard = (): boolean =>
  !hasUnsavedChanges.value || window.confirm('Discard your unsaved changes to this message?')

const saveTemplate = async (payload: Pick<EmailTemplate, 'body' | 'enabled'>) => {
  if (!template.value) return
  isSaving.value = true
  try {
    template.value = await props.client.patch(template.value.id, payload)
    hasUnsavedChanges.value = false
    notificationsStore.addNotification({
      type: 'success',
      title: 'Message saved',
      message: 'The custom auto-reply message has been updated.'
    })
  } catch (error) {
    console.error('[EmailTemplatesView] Failed to save template', error)
    notificationsStore.addNotification({
      type: 'error',
      title: 'Save failed',
      message: 'The custom message could not be saved. Please try again.'
    })
  } finally {
    isSaving.value = false
  }
}

onBeforeRouteLeave(() => confirmDiscard())

const warnBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!hasUnsavedChanges.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  window.addEventListener('beforeunload', warnBeforeUnload)
  loadTemplate()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', warnBeforeUnload)
})
</script>

<i18n lang="json">
{
  "en": {
    "pageTitle": "Auto-reply message",
    "pageSubtitle": "This custom message is inserted into the email sent automatically when someone requests access.",
    "mockNotice": "You are editing a fragment only. The greeting and signature stay with Impresso. This is stored in this browser for now; sending is not wired to the backend yet.",
    "cardTitle": "Request received",
    "loadError": "The auto-reply message could not be loaded."
  }
}
</i18n>

<style>
.EmailTemplatesView.container {
  max-width: 92rem;
}
</style>
