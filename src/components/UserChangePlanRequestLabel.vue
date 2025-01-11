<template>
  <span
    v-html="
      $t('label', {
        planLabel,
        status: $t(`status_${item.status}`),
        date: $d(dateCreatedAsDate, 'short')
      })
    "
  ></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UserChangePlanRequest } from '@/services/types'

const props = defineProps<{
  item: UserChangePlanRequest
  plansLabels: Record<string, string>
}>()
const dateCreatedAsDate = new Date(props.item.dateCreated)
const planLabel = ref(props.plansLabels[props.item.plan.name])
</script>
<i18n lang="json">
{
  "en": {
    "label": "You requested to change plan to <b>{planLabel}</b> on <span class='date'>{date}</span>. Your request is <b>{status}</b>.",
    "status_pending": "pending",
    "status_approved": "approved",
    "status_rejected": "rejected"
  }
}
</i18n>
