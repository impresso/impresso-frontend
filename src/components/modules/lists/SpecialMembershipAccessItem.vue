<template>
  <div class="SpecialMembershipAccessItem container-fluid">
    <div class="row">
      <div class="col-7">
        <h3 class="font-size-inherit m-0 font-weight-bold">{{ item.title }}</h3>
        <p class="small m-0">{{ item.metadata?.provider }}</p>
      </div>
      <div
        v-if="item.requests && item.requests.length > 0"
        class="col-5 d-flex align-items-center justify-content-start gap-2"
      >
        <Icon v-bind="iconArgs" />
        <div class="small">
          <span
            :class="{
              'text-success font-weight-bold': item.requests[0].status === 'approved'
            }"
            >{{ $t(`status.${item.requests[0].status}`) }}
          </span>
          <div class="text-muted small">
            {{ $t('dateCreated') }}
            <TimeAgo :date="item.requests[0].dateCreated" />
          </div>
        </div>
      </div>
      <div
        v-else-if="withActions && (!item.requests || item.requests.length === 0)"
        class="col-5 SpecialMembershipAccessItem__requestAccess"
      >
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="() => emit('request-access', props.item)"
        >
          {{ $t('action.requestAccess') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { SpecialMembershipAccess } from '@/services/types'
import TimeAgo from '../../TimeAgo.vue'
import Icon, { IconProps } from 'impresso-ui-components/components/Icon.vue'
import { computed } from 'vue'

export interface SpecialMembershipAccessItemProps {
  item: SpecialMembershipAccess
  withActions?: boolean
}

const props = defineProps<SpecialMembershipAccessItemProps>()

const emit = defineEmits<{
  (e: 'request-access', item: SpecialMembershipAccess): void
}>()

const iconArgs = computed<IconProps>(() => {
  if (!props.item.requests || props.item.requests.length === 0) {
    return {}
  }
  if (props.item.requests[0].status === 'approved') {
    return {
      name: 'check',
      strokeWidth: 1.5,
      color: 'green'
    }
  } else if (props.item.requests[0].status === 'pending') {
    return {
      name: 'warningCircle',
      strokeWidth: 1.5,
      color: 'var(--bs-warning)'
    }
  } else {
    return {
      name: 'xCircle',

      color: 'var(--bs-danger)'
    }
  }
})
</script>
<i18n lang="json">
{
  "en": {
    "dateCreated": "Requested: ",
    "status": {
      "approved": "Approved",
      "pending": "Pending",
      "rejected": "Rejected"
    },
    "action": {
      "requestAccess": "Request Access"
    }
  }
}
</i18n>
<style>
.SpecialMembershipAccessItem__requestAccess {
  opacity: 0.8;
  transition: opacity 0.2s;
}

.SpecialMembershipAccessItem:hover .SpecialMembershipAccessItem__requestAccess {
  opacity: 1;
}
</style>
