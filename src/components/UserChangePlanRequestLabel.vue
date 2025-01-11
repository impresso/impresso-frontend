<template>
  <span
    v-html="
      $t(`label_${item.status}`, {
        planLabel,
        status: item.status,
        dateCreated: $d(dateCreatedAsDate, 'short'),
        dateLastModified: $d(dateLastModifiedAsDate, 'short')
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
const dateLastModifiedAsDate = new Date(props.item.dateLastModified)
const planLabel = ref(props.plansLabels[props.item.plan.name])
</script>
<i18n lang="json">
{
  "en": {
    "label_pending": "You requested to change plan to <b>{planLabel}</b> on <span class='date'>{dateCreated}</span>. Your request is <b>pending</b> approval.",
    "label_approved": "Your request for the <b>{planLabel}</b> has been accepted on <span class='date'>{dateLastModified}</span>.",
    "label_rejected": "We are sorry, but the request made on <span class='date'>{dateCreated}</span> has been rejected on <span class='date'>{dateLastModified}</span>. Please contact us if you think there has been a mistake."
  }
}
</i18n>
