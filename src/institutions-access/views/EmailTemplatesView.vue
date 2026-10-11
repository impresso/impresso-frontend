<template>
  <div class="container EmailTemplatesView">
    <header class="InstitutionsAccessPageHeader">
      <h1>{{ $t('pageTitle') }}</h1>
      <p>{{ $t('pageSubtitle') }}</p>
    </header>

    <Card class="EmailTemplatesView__card">
      <div v-if="isLoading" class="EmailTemplatesView__skeleton" aria-busy="true">
        <span class="visually-hidden">{{ $t('loading') }}</span>
        <div class="EmailTemplatesView__skeletonBar EmailTemplatesView__skeletonBar--title"></div>
        <div class="EmailTemplatesView__skeletonBar EmailTemplatesView__skeletonBar--copy"></div>
        <div class="EmailTemplatesView__skeletonGrid">
          <div class="EmailTemplatesView__skeletonTile"></div>
          <div class="EmailTemplatesView__skeletonTile"></div>
        </div>
        <div class="EmailTemplatesView__skeletonBar EmailTemplatesView__skeletonBar--block"></div>
      </div>

      <div v-else-if="loadError" class="EmailTemplatesView__state">
        <p class="EmailTemplatesView__stateLead">{{ $t('loadError') }}</p>
        <p class="EmailTemplatesView__stateCopy">{{ $t('loadErrorHint') }}</p>
        <button
          type="button"
          class="btn btn-outline-secondary btn-md px-4 border border-dark"
          @click="loadPlans"
        >
          {{ $t('actions.retry') }}
        </button>
      </div>

      <div v-else-if="plans.length === 0" class="EmailTemplatesView__state">
        <p class="EmailTemplatesView__stateLead">{{ $t('empty') }}</p>
        <p class="EmailTemplatesView__stateCopy">{{ $t('emptyHint') }}</p>
      </div>

      <form v-else-if="reviewSettings" class="EmailTemplatesView__form" @submit.prevent="save">
        <header class="EmailTemplatesView__plan">
          <div class="EmailTemplatesView__planIdentity">
            <p class="small-caps EmailTemplatesView__planKicker">{{ $t('planLabel') }}</p>
            <h2>{{ selectedPlan?.title }}</h2>
            <p v-if="selectedPlan?.metadata?.provider" class="EmailTemplatesView__planProvider">
              {{ selectedPlan.metadata.provider }}
            </p>
          </div>
          <label v-if="plans.length > 1" class="EmailTemplatesView__planPicker">
            <span class="small-caps">{{ $t('switchPlan') }}</span>
            <select
              class="custom-select"
              :value="selectedPlanId ?? ''"
              :disabled="isSaving"
              @change="selectPlan"
            >
              <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                {{ planTitle(plan) }}
              </option>
            </select>
          </label>
        </header>

        <PlanSettingsForm v-model="reviewSettings" :disabled="isSaving" />

        <section
          class="InstitutionsAccessSettingsSection EmailTemplatesView__email"
          aria-labelledby="plan-email-heading"
        >
          <div class="InstitutionsAccessSettingsSection__intro">
            <h3 id="plan-email-heading">{{ $t('emailLegend') }}</h3>
            <p>{{ $t('emailLead') }}</p>
          </div>
          <EmailTemplateEditor
            v-model="emailDraft"
            class="InstitutionsAccessSettingsSection__body"
            :disabled="isSaving"
          />
        </section>

        <div class="EmailTemplatesView__actions">
          <button
            type="submit"
            class="btn btn-outline-secondary btn-md px-4 border border-dark"
            :disabled="!hasUnsavedChanges || isSaving || hasEmailError"
          >
            {{ $t(isSaving ? 'actions.saving' : 'actions.save') }}
          </button>
          <button
            type="button"
            class="btn btn-link EmailTemplatesView__discard"
            :disabled="!hasUnsavedChanges || isSaving"
            @click="resetForm"
          >
            {{ $t('actions.reset') }}
          </button>
          <span v-if="hasUnsavedChanges" class="EmailTemplatesView__dirty">
            {{ $t('unsavedChanges') }}
          </span>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'
import Card from '../components/Card.vue'
import EmailTemplateEditor from '../components/emailTemplates/EmailTemplateEditor.vue'
import PlanSettingsForm from '../components/planSettings/PlanSettingsForm.vue'
import type { PlanReviewSettings } from '../components/planSettings/PlanSettingsForm.vue'
import {
  applyEmailExtraMessage,
  toPatchableMetadata,
  type PatchableSpecialMembershipAccessMetadata
} from '@/logic/specialMembershipAccess'
import {
  EmailBodyMaxLength,
  getDefaultEmailTemplate,
  type EmailTemplate
} from '../services/emailTemplates'
import { specialMembershipAccess as specialMembershipAccessService } from '@/services'
import type { SpecialMembershipAccess } from '@/services/types'
import { useNotificationsStore } from '@/stores/notifications'

export interface SpecialMembershipPlansService {
  find: (params: {
    query: { limit?: number; offset?: number }
  }) => Promise<{ data: SpecialMembershipAccess[] }>
  patch: (
    id: number,
    data: { metadata: PatchableSpecialMembershipAccessMetadata }
  ) => Promise<SpecialMembershipAccess>
}

export interface EmailTemplatesViewProps {
  /** Feathers service for special-membership plans. Stories pass an in-memory mock. */
  service?: SpecialMembershipPlansService
}

const props = withDefaults(defineProps<EmailTemplatesViewProps>(), {
  service: () => specialMembershipAccessService as SpecialMembershipPlansService
})

const { t } = useI18n()
const notificationsStore = useNotificationsStore()

const plans = ref<SpecialMembershipAccess[]>([])
const selectedPlanId = ref<number | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const loadError = ref(false)

// Each form section keeps the last saved value next to the editable draft.
const savedReviewSettings = ref<PlanReviewSettings | null>(null)
const reviewSettings = ref<PlanReviewSettings | null>(null)
const savedEmail = ref<EmailTemplate>(getDefaultEmailTemplate())
const emailDraft = ref<EmailTemplate>(getDefaultEmailTemplate())

const selectedPlan = computed(
  () => plans.value.find(plan => plan.id === selectedPlanId.value) ?? null
)

const planTitle = (plan: SpecialMembershipAccess) =>
  plan.metadata?.provider ? `${plan.title} · ${plan.metadata.provider}` : plan.title

const applyPlanToForm = (plan: SpecialMembershipAccess) => {
  const {
    modality,
    enableTemporaryAutomaticApproval,
    revokeAfterDays,
    revokeTemporaryAutomaticApprovalAfterDays,
    emailExtraMessageHtml,
    emailExtraMessageText
  } = toPatchableMetadata(plan.metadata)

  const review: PlanReviewSettings = {
    modality,
    enableTemporaryAutomaticApproval,
    revokeAfterDays,
    revokeTemporaryAutomaticApprovalAfterDays
  }
  const email: EmailTemplate = {
    body: emailExtraMessageHtml || emailExtraMessageText || '',
    enabled: emailExtraMessageHtml !== null || emailExtraMessageText !== null
  }

  savedReviewSettings.value = review
  reviewSettings.value = { ...review }
  savedEmail.value = email
  emailDraft.value = { ...email }
}

const hasEmailError = computed(() => emailDraft.value.body.length > EmailBodyMaxLength)

const hasUnsavedChanges = computed(() => {
  if (!reviewSettings.value || !savedReviewSettings.value) return false
  return (
    JSON.stringify(reviewSettings.value) !== JSON.stringify(savedReviewSettings.value) ||
    emailDraft.value.body !== savedEmail.value.body ||
    emailDraft.value.enabled !== savedEmail.value.enabled
  )
})

const confirmDiscard = (): boolean =>
  !hasUnsavedChanges.value || window.confirm(t('confirmDiscard'))

const resetForm = () => {
  if (selectedPlan.value) applyPlanToForm(selectedPlan.value)
}

const selectPlan = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const id = Number(select.value)
  if (id === selectedPlanId.value) return
  if (!confirmDiscard()) {
    select.value = String(selectedPlanId.value ?? '')
    return
  }
  selectedPlanId.value = id
  resetForm()
}

const loadPlans = async () => {
  isLoading.value = true
  loadError.value = false
  try {
    const response = await props.service.find({ query: { limit: 50, offset: 0 } })
    plans.value = response?.data ?? []
    // Keep the current plan selected across a retry when it still exists.
    selectedPlanId.value = (selectedPlan.value ?? plans.value[0])?.id ?? null
    resetForm()
  } catch (error) {
    console.error('[EmailTemplatesView] Failed to load plans', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

const save = async () => {
  const plan = selectedPlan.value
  if (!plan || !reviewSettings.value || hasEmailError.value) return
  isSaving.value = true
  try {
    const metadata = applyEmailExtraMessage(
      { ...toPatchableMetadata(plan.metadata), ...reviewSettings.value },
      emailDraft.value
    )
    const updated = await props.service.patch(plan.id, { metadata })
    plans.value = plans.value.map(item => (item.id === updated.id ? updated : item))
    applyPlanToForm(updated)
    notificationsStore.addNotification({
      type: 'success',
      title: t('notifications.saved.title'),
      message: t('notifications.saved.message')
    })
  } catch (error) {
    console.error('[EmailTemplatesView] Failed to save plan settings', error)
    notificationsStore.addNotification({
      type: 'error',
      title: t('notifications.saveFailed.title'),
      message: t('notifications.saveFailed.message')
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
  loadPlans()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', warnBeforeUnload)
})
</script>

<i18n lang="json">
{
  "en": {
    "pageTitle": "Plan settings",
    "pageSubtitle": "Choose how access requests for each plan are reviewed, how long access lasts, and what the auto-reply says.",
    "planLabel": "Membership plan",
    "switchPlan": "Switch plan",
    "emailLegend": "Auto-reply",
    "emailLead": "A short note inserted into the email Impresso already sends when someone requests access.",
    "loading": "Loading plan settings",
    "empty": "No membership plans on this account",
    "emptyHint": "Plans appear here once a collection is assigned to you as reviewer.",
    "loadError": "Plan settings could not be loaded",
    "loadErrorHint": "Check the connection and try again.",
    "unsavedChanges": "Unsaved changes",
    "confirmDiscard": "Discard your unsaved changes to these settings?",
    "notifications": {
      "saved": {
        "title": "Settings saved",
        "message": "The membership plan settings have been updated."
      },
      "saveFailed": {
        "title": "Save failed",
        "message": "The settings could not be saved. Please try again."
      }
    },
    "actions": {
      "save": "Save settings",
      "saving": "Saving",
      "reset": "Discard",
      "retry": "Try again"
    }
  }
}
</i18n>

<style>
.EmailTemplatesView.container {
  max-width: 92rem;
}
.EmailTemplatesView__card.Card {
  padding: 1.75rem 1.75rem 0;
}
.EmailTemplatesView__plan {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.25rem 2rem;
  align-items: flex-end;
  margin: 0 -1.75rem;
  padding: 0 1.75rem 1.5rem;
  border-bottom: 1px solid var(--clr-grey-700);
}
.EmailTemplatesView__planKicker {
  margin: 0 0 0.35rem;
  color: var(--clr-grey-300);
}
.EmailTemplatesView__planIdentity h2 {
  margin: 0;
  max-width: 28ch;
  font-size: 1.55rem;
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-weight: 550;
  font-variation-settings: 'wght' 550;
  text-wrap: balance;
}
.EmailTemplatesView__planProvider {
  margin: 0.35rem 0 0;
  color: var(--clr-grey-200);
  font-size: 0.9rem;
}
.EmailTemplatesView__planPicker {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: min(100%, 20rem);
  margin: 0;
}
.EmailTemplatesView__planPicker .small-caps {
  color: var(--clr-grey-300);
}
.EmailTemplatesView__email.InstitutionsAccessSettingsSection {
  border-bottom: 0;
}
.EmailTemplatesView__actions {
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.85rem;
  margin: 0 -1.75rem;
  padding: 1rem 1.75rem 1.15rem;
  background-color: var(--impresso-color-white);
  border-top: 1px solid var(--clr-grey-700);
  box-shadow: 0 -1.25rem 1.5rem var(--impresso-color-white);
}
.EmailTemplatesView__discard {
  padding-left: 0.15rem;
  padding-right: 0.35rem;
  color: var(--clr-grey-200);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}
.EmailTemplatesView__discard:hover:not(:disabled) {
  color: var(--clr-grey-100);
}
.EmailTemplatesView__discard:disabled {
  opacity: 0.45;
  text-decoration: none;
}
.EmailTemplatesView__dirty {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--clr-grey-300);
  font-variant-numeric: tabular-nums;
}
.EmailTemplatesView__state {
  max-width: 36rem;
  padding: 2.5rem 0 3rem;
}
.EmailTemplatesView__stateLead {
  margin: 0 0 0.4rem;
  font-size: 1.2rem;
  letter-spacing: -0.02em;
  font-weight: 550;
  font-variation-settings: 'wght' 550;
  text-wrap: balance;
}
.EmailTemplatesView__stateCopy {
  margin: 0 0 1.25rem;
  color: var(--clr-grey-200);
  line-height: 1.55;
  text-wrap: pretty;
}
.EmailTemplatesView__skeleton {
  display: grid;
  gap: 1rem;
  padding: 0.25rem 0 2.5rem;
}
.EmailTemplatesView__skeletonBar,
.EmailTemplatesView__skeletonTile {
  background-color: var(--impresso-color-paper);
  border-radius: var(--impresso-border-radius-xs);
  animation: EmailTemplatesView-pulse 1.2s ease-in-out infinite;
}
@keyframes EmailTemplatesView-pulse {
  50% {
    opacity: 0.55;
  }
}
.EmailTemplatesView__skeletonBar--title {
  width: 42%;
  height: 1.6rem;
}
.EmailTemplatesView__skeletonBar--copy {
  width: 68%;
  height: 0.85rem;
}
.EmailTemplatesView__skeletonBar--block {
  height: 9rem;
}
.EmailTemplatesView__skeletonGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.EmailTemplatesView__skeletonTile {
  height: 5.5rem;
}
@media (max-width: 767.98px) {
  .EmailTemplatesView__skeletonGrid {
    grid-template-columns: 1fr;
  }
  .EmailTemplatesView__dirty {
    margin-left: 0;
    width: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .EmailTemplatesView__actions {
    box-shadow: none;
  }
  .EmailTemplatesView__skeletonBar,
  .EmailTemplatesView__skeletonTile {
    animation: none;
  }
}
</style>
