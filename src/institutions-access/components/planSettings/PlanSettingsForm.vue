<template>
  <div class="PlanSettingsForm">
    <section class="InstitutionsAccessSettingsSection" aria-labelledby="plan-notify-heading">
      <div class="InstitutionsAccessSettingsSection__intro">
        <h3 id="plan-notify-heading">{{ $t('notify.legend') }}</h3>
        <p>{{ $t('notify.hint') }}</p>
      </div>

      <fieldset class="InstitutionsAccessSettingsSection__body" :disabled="disabled">
        <div class="PlanSettingsForm__choices" role="radiogroup" :aria-label="$t('notify.legend')">
          <label v-for="option in modalityOptions" :key="option" class="PlanSettingsForm__choice">
            <input
              type="radio"
              name="plan-modality"
              :value="option"
              :checked="modelValue.modality === option"
              @change="patch({ modality: option })"
            />
            <span>
              <span class="PlanSettingsForm__choiceTitle">{{
                $t(`modality.${option}.label`)
              }}</span>
              <span class="PlanSettingsForm__choiceHint">{{ $t(`modality.${option}.hint`) }}</span>
            </span>
          </label>
        </div>
      </fieldset>
    </section>

    <section class="InstitutionsAccessSettingsSection" aria-labelledby="plan-access-heading">
      <div class="InstitutionsAccessSettingsSection__intro">
        <h3 id="plan-access-heading">{{ $t('access.legend') }}</h3>
        <p>{{ $t('access.hint') }}</p>
      </div>

      <fieldset class="InstitutionsAccessSettingsSection__body" :disabled="disabled">
        <div class="PlanSettingsForm__block">
          <div class="PlanSettingsForm__blockHead">
            <BFormCheckbox
              switch
              class="InstitutionsAccessSwitch"
              :model-value="modelValue.enableTemporaryAutomaticApproval"
              @update:model-value="
                value => patch({ enableTemporaryAutomaticApproval: Boolean(value) })
              "
            >
              <span class="PlanSettingsForm__blockTitle">{{ $t('temporary.enabled') }}</span>
              <span class="PlanSettingsForm__blockHint">{{ $t('temporary.hint') }}</span>
            </BFormCheckbox>
          </div>

          <div
            v-if="modelValue.enableTemporaryAutomaticApproval"
            class="PlanSettingsForm__duration PlanSettingsForm__duration--nested"
            role="radiogroup"
            :aria-label="$t('temporary.endsLabel')"
          >
            <div class="small-caps PlanSettingsForm__label">{{ $t('temporary.endsLabel') }}</div>
            <label class="PlanSettingsForm__option">
              <input
                type="radio"
                name="plan-temp-limit"
                :checked="modelValue.revokeTemporaryAutomaticApprovalAfterDays === null"
                @change="patch({ revokeTemporaryAutomaticApprovalAfterDays: null })"
              />
              {{ $t('temporary.untilDecision') }}
            </label>
            <label class="PlanSettingsForm__option">
              <input
                type="radio"
                name="plan-temp-limit"
                :checked="modelValue.revokeTemporaryAutomaticApprovalAfterDays !== null"
                @change="patch({ revokeTemporaryAutomaticApprovalAfterDays: DefaultTemporaryDays })"
              />
              {{ $t('after') }}
              <input
                class="form-control PlanSettingsForm__daysInput"
                type="number"
                min="1"
                step="1"
                inputmode="numeric"
                :aria-label="$t('temporary.daysLabel')"
                :disabled="modelValue.revokeTemporaryAutomaticApprovalAfterDays === null"
                :value="toInputValue(modelValue.revokeTemporaryAutomaticApprovalAfterDays)"
                @input="setDays('revokeTemporaryAutomaticApprovalAfterDays', $event)"
                @blur="syncInput($event, modelValue.revokeTemporaryAutomaticApprovalAfterDays)"
              />
              {{ $t('days') }}
            </label>
          </div>
        </div>

        <div class="PlanSettingsForm__block">
          <div class="PlanSettingsForm__blockHead">
            <span class="PlanSettingsForm__blockTitle">{{ $t('revoke.label') }}</span>
            <span class="PlanSettingsForm__blockHint">{{ $t('revoke.hint') }}</span>
          </div>
          <div
            class="PlanSettingsForm__duration"
            role="radiogroup"
            :aria-label="$t('revoke.label')"
          >
            <label class="PlanSettingsForm__option">
              <input
                type="radio"
                name="plan-revoke-limit"
                :checked="modelValue.revokeAfterDays === null"
                @change="patch({ revokeAfterDays: null })"
              />
              {{ $t('revoke.untilRevoked') }}
            </label>
            <label class="PlanSettingsForm__option">
              <input
                type="radio"
                name="plan-revoke-limit"
                :checked="modelValue.revokeAfterDays !== null"
                @change="patch({ revokeAfterDays: DefaultApprovedDays })"
              />
              {{ $t('for') }}
              <input
                class="form-control PlanSettingsForm__daysInput"
                type="number"
                min="1"
                step="1"
                inputmode="numeric"
                :aria-label="$t('revoke.daysLabel')"
                :disabled="modelValue.revokeAfterDays === null"
                :value="toInputValue(modelValue.revokeAfterDays)"
                @input="setDays('revokeAfterDays', $event)"
                @blur="syncInput($event, modelValue.revokeAfterDays)"
              />
              {{ $t('days') }}
            </label>
          </div>
        </div>
      </fieldset>
    </section>
  </div>
</template>

<script setup lang="ts">
import BFormCheckbox from '@/components/legacy/bootstrap/BFormCheckbox.vue'
import type { SpecialMembershipAccessModality } from '@/services/types'

export interface PlanReviewSettings {
  modality: SpecialMembershipAccessModality
  enableTemporaryAutomaticApproval: boolean
  revokeAfterDays: number | null
  revokeTemporaryAutomaticApprovalAfterDays: number | null
}

export interface PlanSettingsFormProps {
  modelValue: PlanReviewSettings
  disabled?: boolean
}

const props = withDefaults(defineProps<PlanSettingsFormProps>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: PlanReviewSettings): void
}>()

const modalityOptions: SpecialMembershipAccessModality[] = ['cc_reviewer', 'notify_reviewer']

/** Values suggested when a reviewer switches a duration from "no limit" to "limited". */
const DefaultTemporaryDays = 14
const DefaultApprovedDays = 365

type DaysField = 'revokeAfterDays' | 'revokeTemporaryAutomaticApprovalAfterDays'

const patch = (partial: Partial<PlanReviewSettings>) => {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}

const toInputValue = (value: number | null) => (value === null ? '' : String(value))

const fromInputValue = (value: string): number | null => {
  if (value.trim() === '') return null
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return null
  return parsed
}

// "No limit" is chosen with its own radio, so an empty or invalid entry keeps
// the last valid value instead of silently switching the limit off.
const setDays = (field: DaysField, event: Event) => {
  const value = fromInputValue((event.target as HTMLInputElement).value)
  if (value !== null) patch({ [field]: value })
}

const syncInput = (event: Event, value: number | null) => {
  ;(event.target as HTMLInputElement).value = toInputValue(value)
}
</script>

<i18n lang="json">
{
  "en": {
    "notify": {
      "legend": "Notifications",
      "hint": "How the reviewer hears about a new access request."
    },
    "modality": {
      "cc_reviewer": {
        "label": "Copy the reviewer",
        "hint": "The reviewer is copied on the email sent to the requester."
      },
      "notify_reviewer": {
        "label": "Notify separately",
        "hint": "The reviewer gets a separate notice, not a copy of the requester email."
      }
    },
    "access": {
      "legend": "Access",
      "hint": "What the requester gets while waiting, and how long approved access lasts."
    },
    "temporary": {
      "enabled": "Grant provisional access while the request is reviewed",
      "hint": "The requester can use the collection right away. A reviewer can still reject the request.",
      "endsLabel": "Provisional access ends",
      "untilDecision": "When a reviewer decides",
      "daysLabel": "Provisional access length in days"
    },
    "revoke": {
      "label": "Approved access lasts",
      "hint": "Applies once a reviewer approves the request.",
      "untilRevoked": "Until a reviewer revokes it",
      "daysLabel": "Approved access length in days"
    },
    "after": "After",
    "for": "For",
    "days": "days"
  }
}
</i18n>

<style>
.PlanSettingsForm__choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.PlanSettingsForm__choice {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin: 0;
  padding: 0.95rem 1rem;
  border: 1px solid var(--clr-grey-600);
  border-radius: var(--impresso-border-radius-xs);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}
.PlanSettingsForm__choice:hover {
  border-color: var(--clr-grey-400);
}
.PlanSettingsForm__choice:has(input:checked) {
  border-color: var(--impresso-color-black);
  background-color: var(--impresso-color-paper);
}
.PlanSettingsForm__choice:focus-within {
  outline: 2px solid var(--impresso-color-black);
  outline-offset: 2px;
}
.PlanSettingsForm__choice input {
  margin-top: 0.28rem;
  flex-shrink: 0;
}
.PlanSettingsForm__choiceTitle,
.PlanSettingsForm__blockTitle {
  display: block;
  font-weight: 550;
  font-variation-settings: 'wght' 550;
  letter-spacing: -0.01em;
}
.PlanSettingsForm__choiceHint,
.PlanSettingsForm__blockHint {
  display: block;
  margin-top: 0.2rem;
  color: var(--clr-grey-300);
  font-size: 0.85rem;
  line-height: 1.45;
  text-wrap: pretty;
}
.PlanSettingsForm__block {
  border: 1px solid var(--clr-grey-600);
  border-radius: var(--impresso-border-radius-xs);
}
.PlanSettingsForm__block + .PlanSettingsForm__block {
  margin-top: 0.75rem;
}
.PlanSettingsForm__blockHead {
  padding: 0.95rem 1rem;
}
.PlanSettingsForm__blockHead label {
  cursor: pointer;
}
.PlanSettingsForm__duration {
  display: grid;
  gap: 0.55rem;
  padding: 0 1rem 1rem;
}
.PlanSettingsForm__duration--nested {
  margin: 0 1rem 1rem;
  padding: 0.85rem 1rem;
  background-color: var(--impresso-color-paper);
  border-radius: var(--impresso-border-radius-xs);
}
.PlanSettingsForm__label {
  display: block;
  margin-bottom: 0.1rem;
  color: var(--clr-grey-300);
}
.PlanSettingsForm__option {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.25rem;
  margin: 0;
  font-size: 0.92rem;
  cursor: pointer;
}
.PlanSettingsForm__option input[type='radio'] {
  margin: 0 0.15rem 0 0;
}
.PlanSettingsForm__daysInput.form-control {
  width: 5.5rem;
  height: 2.1rem;
  padding: 0.25rem 0.55rem;
  font-variant-numeric: tabular-nums;
}
.PlanSettingsForm__daysInput.form-control:disabled {
  opacity: 0.5;
}
@media (max-width: 767.98px) {
  .PlanSettingsForm__choices {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .PlanSettingsForm__choice {
    transition: none;
  }
}
</style>
