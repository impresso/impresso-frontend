<template>
  <div class="SpecialMembershipAccessItem container-fluid">
    <div
      :class="{
        row: props.asContainer
      }"
    >
      <div
        :class="{
          'col-6': props.asContainer
        }"
        class="d-flex flex-column justify-content-center gap-1"
      >
        <h3 class="font-size-inherit m-0 font-weight-bold">{{ item.title }}</h3>
        <p class="small m-0">{{ item.metadata?.provider }}</p>
      </div>
      <div
        :class="{
          'col-6': props.asContainer
        }"
      >
        <section class="d-flex gap-2 align-items-center flex-wrap w-100">
          <div
            v-if="hasRequests"
            class="d-flex align-items-center justify-content-start gap-2 flex-grow-1"
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
          <div v-if="showActions" class="SpecialMembershipAccessItem__requestAccess">
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="() => emit('request-access', props.item)"
            >
              {{ $t('action.requestAccess') }}
            </button>
          </div>
        </section>
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
  asContainer?: boolean
}

const props = withDefaults(defineProps<SpecialMembershipAccessItemProps>(), {
  withActions: false,
  asContainer: true
})

const emit = defineEmits<{
  (e: 'request-access', item: SpecialMembershipAccess): void
}>()

const hasRequests = computed(() => {
  return props.item.requests && props.item.requests.length > 0
})

const showActions = computed(() => {
  if (!hasRequests.value) {
    return props.withActions
  }
  // # with requests, show actions only if the status is NOT pending, approved or temporary (i.e. if the user can still do something about it)
  const status = props.item.requests[0].status
  const isFinal = status === 'approved' || status === 'pending' || status === 'temporary'
  return props.withActions && !isFinal
})

const iconArgs = computed<IconProps>(() => {
  if (!props.item.requests || props.item.requests.length === 0) {
    return {}
  }
  if (
    props.item.requests[0].status === 'approved' ||
    props.item.requests[0].status === 'temporary'
  ) {
    return {
      name: 'check',
      strokeWidth: 1.5,
      color: 'green'
    }
  } else if (
    props.item.requests[0].status === 'pending' ||
    props.item.requests[0].status === 'revoked'
  ) {
    return {
      name: 'warningCircle',
      strokeWidth: 1.5,
      color: 'var(--bs-warning)'
    }
  } else if (props.item.requests[0].status === 'rejected') {
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
      "rejected": "Rejected",
      "revoked": "Temporary Access Ended",
      "temporary": "Temporary Access"
    },
    "action": {
      "requestAccess": "Request Full Access"
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
