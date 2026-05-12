<template>
  <div class="SpecialMembershipAccessItem" :class="{ 'container-fluid': props.asContainer }">
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
          <div v-if="showMetadata">
            <div
              class="d-flex align-items-center gap-2"
              v-for="metadataKey in ['enableTemporaryAutomaticAcceptance', 'revokeAfterDays']"
              :key="metadataKey"
            >
              <div class="text-muted small">{{ $t(`metadata.${metadataKey}.label`) }}</div>

              <div
                class="smallcaps"
                v-html="
                  $t(
                    `metadata.${metadataKey}.${item.metadata![metadataKey] ? 'available' : 'disabled'}`,
                    { value: item.metadata![metadataKey] }
                  )
                "
              ></div>

              <InfoButton
                :name="
                  $t(
                    `metadata.${metadataKey}.infoTitle.${item.metadata![metadataKey] ? 'available' : 'disabled'}`
                  )
                "
                :default-content="
                  $t(
                    `metadata.${metadataKey}.infoText.${item.metadata![metadataKey] ? 'available' : 'disabled'}`
                  )
                "
              >
              </InfoButton>
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
import InfoButton from '@/components/base/InfoButton.vue'
import {
  SpecialMembershipRequestStatusApproved,
  SpecialMembershipRequestStatusPendingTemporary,
  SpecialMembershipRequestStatusTemporary,
  SpecialMembershipRequestStatusRevoked,
  SpecialMembershipRequestStatusPending,
  SpecialMembershipRequestStatusRejected
} from '@/constants'

export interface SpecialMembershipAccessItemProps {
  item: SpecialMembershipAccess
  withActions?: boolean
  withMetadata?: boolean
  asContainer?: boolean
}

const props = withDefaults(defineProps<SpecialMembershipAccessItemProps>(), {
  withActions: false,
  asContainer: true,
  withMetadata: false
})

const emit = defineEmits<{
  (e: 'request-access', item: SpecialMembershipAccess): void
}>()

const hasRequests = computed(() => {
  return props.item.requests && props.item.requests.length > 0
})

const showMetadata = computed(() => {
  return props.withMetadata && props.item.metadata
})
const showActions = computed(() => {
  if (!hasRequests.value) {
    return props.withActions
  }
  // # with requests, show actions only if the status is NOT pending, approved or temporary (i.e. if the user can still do something about it)
  const status = props.item.requests[0].status
  const isFinal =
    status === SpecialMembershipRequestStatusApproved ||
    status === SpecialMembershipRequestStatusPending ||
    status === SpecialMembershipRequestStatusTemporary ||
    status === SpecialMembershipRequestStatusPendingTemporary
  return props.withActions && !isFinal
})

const iconArgs = computed<IconProps>(() => {
  if (!props.item.requests || props.item.requests.length === 0) {
    return {}
  }
  if (
    props.item.requests[0].status === SpecialMembershipRequestStatusApproved ||
    props.item.requests[0].status === SpecialMembershipRequestStatusTemporary ||
    props.item.requests[0].status === SpecialMembershipRequestStatusPendingTemporary
  ) {
    return {
      name: 'check',
      strokeWidth: 1.5,
      color: 'green'
    }
  } else if (
    props.item.requests[0].status === SpecialMembershipRequestStatusPending ||
    props.item.requests[0].status === SpecialMembershipRequestStatusRevoked
  ) {
    return {
      name: 'warningCircle',
      strokeWidth: 1.5,
      color: 'var(--bs-warning)'
    }
  } else if (props.item.requests[0].status === SpecialMembershipRequestStatusRejected) {
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
      "revoked": "Provisional Access Ended",
      "temporary": "Provisional Access",
      "pending-t": "Pending Provisional Access request"
    },
    "metadata": {
      "enableTemporaryAutomaticAcceptance": {
        "label": "Provisional access:",
        "available": "available",
        "disabled": "Disabled",
        "infoTitle": {
          "available": "What is Provisional Access?",
          "disabled": "What is Provisional Access?"
        },
        "infoText": {
          "available": "This special membership access is automatically granted for a limited time. When you request access, you’ll receive immediate provisional access to items in this domain in Datalab or CSV Export. After your access expires, you can reapply, but your request will be reviewed and may take some time.",
          "disabled": "This special membership access is not set for automatic approval. When you request access, it will be reviewed before you can access the content item and other items in the same domain in Datalab or in CSV Export. Thank you for your patience while your request is being processed!"
        }
      },
      "revokeAfterDays": {
        "label": "Duration of provisional access: ",
        "available": "{value} days",
        "disabled": "N/A",
        "infoTitle": {
          "available": "Provisional access available",
          "disabled": "Access revocation disabled"
        },
        "infoText": {
          "available": "This special membership access is configured to be automatically revoked after a certain number of days. This means that when you request access, you will have provisional access to the content item and other items in the same domain in Datalab or in CSV Export. Please note that this provisional access will last only for a limited time, after which your access will be automatically revoked.",
          "disabled": "This special membership does not offer provisional access, normally the access duration would be specified here."
        }
      }
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
